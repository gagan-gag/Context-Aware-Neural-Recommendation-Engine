"""Simple DAG syntax validation (no Airflow import needed)."""
import ast
from pathlib import Path

def validate_dag_syntax(dag_file):
    """Validate DAG Python syntax."""
    with open(dag_file, 'r') as f:
        code = f.read()
    
    try:
        ast.parse(code)
        return True, "Valid syntax"
    except SyntaxError as e:
        return False, str(e)


if __name__ == "__main__":
    dags_dir = Path(__file__).parent / "dags"
    
    for dag_file in dags_dir.glob("*_dag.py"):
        valid, msg = validate_dag_syntax(dag_file)
        status = "✅" if valid else "❌"
        print(f"{status} {dag_file.name}: {msg}")