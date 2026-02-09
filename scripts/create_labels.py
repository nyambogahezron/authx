import subprocess
import time

todos_file = "todos.txt"
labels_created = set()

LABEL_COLORS = {
    "auth": "1d76db",
    "authentication": "1d76db",
    "security": "b60205",
    "infrastructure": "5319e7",
    "developer-tools": "0e8a16",
    "advanced-features": "fbca04",
    "ui-components": "c2e0c6",
    "billing--monetization": "0052cc",
    "integrations": "d93f0b",
    "development": "006b75",
    "tech-stack": "a2eeef",
    "apps": "f9d0c4",
    "architecture": "000000"
}

def create_labels():
    labels_to_create = set()
    
    with open(todos_file, "r") as f:
        lines = f.readlines()
        
    for line in lines:
        if line.startswith("LABELS:"):
            # Could be comma separated
            current_labels = line[7:].strip().split(",")
            for l in current_labels:
                l = l.strip()
                if l:
                    labels_to_create.add(l)
    
    print(f"Found {len(labels_to_create)} unique labels: {labels_to_create}")
    
    existing_labels = get_existing_labels()
    
    for label in labels_to_create:
        if label in existing_labels:
            print(f"Label '{label}' already exists.")
            continue
            
        color = LABEL_COLORS.get(label, "cccccc") # Default gray
        run_gh_label_create(label, color)

def get_existing_labels():
    try:
        # List labels, just names
        result = subprocess.run(["gh", "label", "list", "--limit", "500", "--json", "name"], capture_output=True, text=True, check=True)
        import json
        data = json.loads(result.stdout)
        return {item["name"] for item in data}
    except Exception as e:
        print(f"Failed to list labels: {e}")
        return set()

def run_gh_label_create(name, color):
    cmd = ["gh", "label", "create", name, "--color", color, "--description", f"Label for {name}"]
    print(f"Creating label: {name}")
    try:
        subprocess.run(cmd, check=True)
        time.sleep(0.5)
    except subprocess.CalledProcessError as e:
        print(f"Failed to create label {name}: {e}")

if __name__ == "__main__":
    create_labels()
