import ssl
from collections.abc import Generator

import boto3
from sqlalchemy import event
from sqlmodel import Session, create_engine

from .utils import (
    build_database_url,
    get_database_config,
    get_local_dev_config,
    is_local_dev,
)

# Generated: must match runtimeConfigKey in config.json
_runtime_config_key = "MySqlDb"

_engine = None


def _create_engine():
    ssl_args: dict = {} if is_local_dev() else {"ssl": ssl.create_default_context()}
    if is_local_dev():
        cfg = get_local_dev_config()
        url = build_database_url(cfg["dbUser"], cfg["host"], cfg["port"], cfg["dbName"])
    else:
        config = get_database_config(_runtime_config_key)
        url = build_database_url(
            config["dbUser"],
            config["hostname"],
            config["port"],
            config["database"],
        )
    engine = create_engine(url, connect_args=ssl_args)

    @event.listens_for(engine, "do_connect")
    def provide_password(_dialect, _connection_record, _cargs, connection_params):
        if is_local_dev():
            connection_params["password"] = get_local_dev_config()["dbPassword"]
        else:
            config = get_database_config(_runtime_config_key)
            connection_params["password"] = boto3.client(
                "rds",
                region_name=config["region"],
            ).generate_db_auth_token(
                DBHostname=config["hostname"],
                Port=config["port"],
                DBUsername=config["dbUser"],
            )

    return engine


def get_engine():
    global _engine
    if _engine is None:
        _engine = _create_engine()
    return _engine


def get_session() -> Generator[Session]:
    with Session(get_engine()) as session:
        yield session
