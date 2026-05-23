import httpx
import re
from typing import List, Dict, Any, Tuple
from app.config import settings

class GitHubService:
    def __init__(self):
        self.headers = {"Accept": "application/vnd.github.v3+json"}
        if settings.github_token:
            self.headers["Authorization"] = f"token {settings.github_token}"

    def parse_repo_url(self, repo_url: str) -> Tuple[str, str]:
        """Parses owner and repo name from GitHub URL."""
        cleaned = repo_url.strip().rstrip("/")
        match = re.match(r"^https?://(?:www\.)?github\.com/([^/]+)/([^/&#\?]+)", cleaned)
        if not match:
            raise ValueError("Invalid GitHub URL format.")
        owner = match.group(1)
        repo = match.group(2)
        if repo.endswith(".git"):
            repo = repo[:-4]
        return owner, repo

    async def get_default_branch(self, owner: str, repo: str) -> str:
        """Fetches the repository default branch."""
        url = f"https://api.github.com/repos/{owner}/{repo}"
        async with httpx.AsyncClient(headers=self.headers, timeout=10.0) as client:
            response = await client.get(url)
            if response.status_code == 404:
                raise ValueError("Repository not found or is private.")
            elif response.status_code != 200:
                raise ValueError(f"GitHub API Error: {response.text}")
            
            data = response.json()
            return data.get("default_branch", "main")

    async def fetch_repo_files(self, repo_url: str) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Parses URL, fetches full file tree, filters by extension/size/directory,
        and returns a list of candidate file dictionaries containing path and size.
        """
        owner, repo = self.parse_repo_url(repo_url)
        branch = await self.get_default_branch(owner, repo)
        
        tree_url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{branch}?recursive=1"
        
        async with httpx.AsyncClient(headers=self.headers, timeout=15.0) as client:
            response = await client.get(tree_url)
            if response.status_code != 200:
                raise ValueError(f"Failed to fetch repository tree: {response.text}")
            
            tree_data = response.json()
            tree = tree_data.get("tree", [])
            
            # Filtering rules
            allowed_extensions = {".py", ".js", ".ts", ".jsx", ".tsx", ".java", ".cpp", ".c"}
            skip_patterns = ["node_modules", "__pycache__", ".git", "dist", "build", "lock"]
            
            filtered_files = []
            max_size_bytes = settings.max_file_size_kb * 1024
            
            for node in tree:
                if node.get("type") == "blob":
                    path = node.get("path", "")
                    size = node.get("size", 0)
                    
                    # Check extension
                    has_allowed_ext = any(path.endswith(ext) for ext in allowed_extensions)
                    if not has_allowed_ext:
                        continue
                        
                    # Check skip patterns in path segments
                    path_lower = path.lower()
                    should_skip = any(pattern in path_lower for pattern in skip_patterns)
                    if should_skip:
                        continue
                        
                    # Check size limit
                    if size > max_size_bytes:
                        continue
                        
                    filtered_files.append({
                        "path": path,
                        "size": size,
                        "url": node.get("url")
                    })
            
            # Sort files by path for consistency
            filtered_files.sort(key=lambda x: x["path"])
            
            return f"{owner}/{repo}", filtered_files

    async def fetch_file_content(self, owner: str, repo: str, path: str) -> str:
        """Fetches the raw text content of a file."""
        # We can use either raw.githubusercontent.com or API with raw Accept header
        # Using raw.githubusercontent.com is highly reliable for public files and handles large files nicely
        raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/refs/heads/master/{path}"
        
        # We try to use the contents API with raw media type first because it supports the GITHUB_TOKEN header
        # which prevents rate-limiting issues for private/semi-private content or frequent hits.
        api_url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
        
        headers = self.headers.copy()
        headers["Accept"] = "application/vnd.github.v3.raw"
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            # First try api with auth token headers
            response = await client.get(api_url, headers=headers)
            if response.status_code == 200:
                return response.text
                
            # Fallback to direct raw download
            # We fetch the repository default branch first to replace 'master' if needed
            fallback_branch = "master"
            try:
                fallback_branch = await self.get_default_branch(owner, repo)
            except Exception:
                pass
                
            raw_url = f"https://raw.githubusercontent.com/{owner}/{repo}/{fallback_branch}/{path}"
            response = await client.get(raw_url)
            if response.status_code == 200:
                return response.text
            
            raise ValueError(f"Could not download content for {path}. HTTP Status {response.status_code}")
