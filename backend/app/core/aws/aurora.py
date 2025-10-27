import aiomysql

from app.core.constants.constants import (
    AWS_RDS_CLUSTER_INSTANCE_PORT,
    AWS_RDS_CLUSTER_INSTANCE_URL,
    AWS_RDS_CLUSTER_MASTER_USERNAME,
)
from app.core.constants.secrets import AWS_RDS_CLUSTER_MASTER_PASSWORD


async def execute_async(query: str, dbname: str) -> None:
    """Execute a query asynchronously on Aurora MySQL database using aiomysql."""
    conn = await aiomysql.connect(
        host=AWS_RDS_CLUSTER_INSTANCE_URL,
        port=AWS_RDS_CLUSTER_INSTANCE_PORT,
        user=AWS_RDS_CLUSTER_MASTER_USERNAME,
        password=AWS_RDS_CLUSTER_MASTER_PASSWORD,
        db=dbname,
        autocommit=True,
    )
    cur = await conn.cursor()
    await cur.execute(query)
    print(cur.description)
    r = await cur.fetchall()
    print(r)
    await cur.close()
    conn.close()
