import asyncio
import secrets
import ssl
from typing import Any

import asyncmy

from .utils import get_database_secret, with_connection_retry


async def _ensure_database_user(db_user: str) -> None:
    secret = get_database_secret()
    conn = await asyncmy.connect(
        host=secret["host"],
        port=int(secret["port"]),
        db=secret["dbname"],
        user=secret["username"],
        password=secret["password"],
        ssl=ssl.create_default_context(),
    )
    try:
        async with conn.cursor() as cursor:
            await cursor.execute(
                "CREATE USER IF NOT EXISTS %s@'%%' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS'",
                (db_user,),
            )
            await cursor.execute(
                "ALTER USER %s@'%%' IDENTIFIED WITH AWSAuthenticationPlugin AS 'RDS' REQUIRE SSL",
                (db_user,),
            )
            await cursor.execute(
                f"GRANT SELECT, INSERT, UPDATE, DELETE ON `{secret['dbname']}`.* TO %s@'%%'",
                (db_user,),
            )
        await conn.commit()
    finally:
        conn.close()


_PHYSICAL_RESOURCE_ID_PREFIX = "db-user:"


def _resolve_db_user(physical_resource_id: str | None) -> str:
    if physical_resource_id and physical_resource_id.startswith(_PHYSICAL_RESOURCE_ID_PREFIX):
        return physical_resource_id[len(_PHYSICAL_RESOURCE_ID_PREFIX) :]
    return f"db_{secrets.token_hex(8)}"


def handler(event: dict[str, Any], _context: Any) -> dict[str, Any]:
    db_user = _resolve_db_user(event.get("PhysicalResourceId"))

    if event.get("RequestType") != "Delete":
        with_connection_retry(lambda: asyncio.run(_ensure_database_user(db_user)))

    return {
        "PhysicalResourceId": f"{_PHYSICAL_RESOURCE_ID_PREFIX}{db_user}",
        "Data": {"dbUser": db_user},
    }
