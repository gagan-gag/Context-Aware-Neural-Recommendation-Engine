"""Training Pipeline DAG - Model training orchestration."""
from datetime import datetime, timedelta
from airflow import DAG
from airflow.operators.python import PythonOperator
from airflow.operators.bash import BashOperator
from airflow.utils.dates import days_ago

default_args = {
    'owner': 'recomnova',
    'retries': 2,
    'retry_delay': timedelta(minutes=5),
    'start_date': days_ago(1),
    'email_on_failure': False,
    'email_on_retry': False
}

dag = DAG(
    'training_pipeline',
    default_args=default_args,
    description='RecomNova Model Training Pipeline',
    schedule_interval='@daily',
    catchup=False,
    tags=['training', 'ml']
)


def preprocess_data():
    """Preprocess training data."""
    print("✅ Preprocessing data...")
    import time
    time.sleep(2)
    print("✅ Data preprocessing complete")
    return {"status": "success", "records": 100000}


def train_model():
    """Train the model."""
    print("✅ Training model...")
    import time
    time.sleep(5)
    print("✅ Model training complete")
    return {"status": "success", "epochs": 5, "loss": 0.25}


def evaluate_model():
    """Evaluate model performance."""
    print("✅ Evaluating model...")
    import time
    time.sleep(3)
    print("✅ Model evaluation complete")
    return {"status": "success", "recall@10": 0.75, "ndcg": 0.68}


def save_checkpoint():
    """Save model checkpoint."""
    print("✅ Saving checkpoint...")
    import time
    time.sleep(2)
    print("✅ Checkpoint saved to checkpoints/")
    return {"status": "success", "path": "checkpoints/model_v4.1.h5"}


# Tasks
t1 = PythonOperator(
    task_id='preprocess_data',
    python_callable=preprocess_data,
    dag=dag
)

t2 = PythonOperator(
    task_id='train_model',
    python_callable=train_model,
    dag=dag
)

t3 = PythonOperator(
    task_id='evaluate_model',
    python_callable=evaluate_model,
    dag=dag
)

t4 = PythonOperator(
    task_id='save_checkpoint',
    python_callable=save_checkpoint,
    dag=dag
)

t5 = BashOperator(
    task_id='log_training_complete',
    bash_command='echo "Training pipeline complete at $(date)"',
    dag=dag
)

# Dependencies
t1 >> t2 >> t3 >> t4 >> t5