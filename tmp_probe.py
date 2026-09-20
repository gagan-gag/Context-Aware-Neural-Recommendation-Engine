from pyspark.sql import SparkSession
from pyspark.sql.functions import col, when, count, avg, countDistinct, sum as spark_sum

spark = SparkSession.builder.appName('probe-agg').master('local[1]').config('spark.ui.enabled','false').config('spark.sql.session.timeZone','UTC').config('spark.local.dir','C:/tmp/avero-spark-probe').config('spark.sql.shuffle.partitions','1').config('spark.default.parallelism','1').config('spark.sql.adaptive.enabled','false').config('spark.python.worker.reuse','false').config('spark.driver.host','127.0.0.1').config('spark.driver.bindAddress','127.0.0.1').getOrCreate()
df = spark.createDataFrame([
    ('T1','2020-01-15','C1','A1',50.0,1,2020,1,15,4),
    ('T2','2020-02-10','C2','A1',50.0,1,2020,2,10,2),
    ('T3','2020-03-20','C3','A1',51.0,2,2020,3,20,5),
    ('T4','2020-04-05','C4','A1',49.0,2,2020,4,5,1),
    ('T5','2019-06-01','C1','A2',100.0,1,2019,6,1,3),
    ('T6','2020-01-15','C5','A2',150.0,2,2020,1,15,4),
], ['transaction_id','t_dat','customer_id','article_id','price','sales_channel_id','transaction_year','transaction_month','transaction_day','transaction_dayofweek'])
df = df.withColumn('transaction_date', df.t_dat.cast('timestamp'))
print(df.groupBy('article_id').agg(count('transaction_id').alias('cnt'), countDistinct('customer_id').alias('uniq'), avg('price').alias('avg')).collect())
print(df.groupBy('article_id').agg(count('transaction_id').alias('n'), spark_sum(when(col('sales_channel_id') == 1, 1).otherwise(0)).alias('online')).collect())
print(df.orderBy('article_id').show())
spark.stop()
