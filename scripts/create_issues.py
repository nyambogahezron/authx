import subprocess
import time

todos_file = "todos.txt"

def create_issues():
    with open(todos_file, "r") as f:
        content = f.read()

    
    lines = content.split('\n')
    
    current_task = {}
    

    # Get existing issues to avoid duplicates
    existing_titles = get_existing_issue_titles()
    
    for line in lines:
        line = line.strip()
        if not line:
            if current_task and "title" in current_task:
                # Create issue if not exists
                if current_task["title"] not in existing_titles:
                    run_gh_create(current_task)
                else:
                    print(f"Skipping existing issue: {current_task['title']}")
                current_task = {}
            continue
            
        if line.startswith("TITLE:"):
            current_task["title"] = line[6:].strip()
        elif line.startswith("DESC:"):
            current_task["desc"] = line[5:].strip()
        elif line.startswith("LABELS:"):
            current_task["labels"] = line[7:].strip()
            
    # Process the last one if key exists
    if current_task and "title" in current_task:
        if current_task["title"] not in existing_titles:
            run_gh_create(current_task)
        else:
            print(f"Skipping existing issue: {current_task['title']}")

def get_existing_issue_titles():
    # Fetch all open issues titles
    try:
        result = subprocess.run(["gh", "issue", "list", "--state", "all", "--limit", "500", "--json", "title"], capture_output=True, text=True, check=True)
        import json
        data = json.loads(result.stdout)
        return {item["title"] for item in data}
    except Exception as e:
        print(f"Failed to fetch existing issues: {e}")
        return set()

def run_gh_create(task):
    title = task.get("title")
    body = task.get("desc", "")
    labels = task.get("labels", "")
    
    cmd = ["gh", "issue", "create", "--title", title, "--body", body]
    if labels:
        cmd.extend(["--label", labels])
        
    print(f"Creating issue: {title}")
    try:
        subprocess.run(cmd, check=True)
        time.sleep(2) # Increased sleep to be safer
    except subprocess.CalledProcessError:
        print(f"Failed to create issue: {title}")

if __name__ == "__main__":
    create_issues()
