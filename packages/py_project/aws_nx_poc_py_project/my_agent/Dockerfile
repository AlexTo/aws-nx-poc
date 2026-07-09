FROM public.ecr.aws/docker/library/python:3.14-slim

WORKDIR /app

# Copy bundled package
COPY . /app

ADD https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem /usr/local/share/ca-certificates/rds-global-bundle.crt
RUN update-ca-certificates

EXPOSE 8080

ENV PYTHONPATH=/app
ENV PATH="/app/bin:${PATH}"

# Auto-instrument with AWS Distro for OpenTelemetry
# https://aws-otel.github.io/docs/getting-started/python-sdk/auto-instr
CMD ["python", "bin/opentelemetry-instrument", "python", "-m", "uvicorn", "aws_nx_poc_py_project.my_agent.main:app", "--host", "0.0.0.0", "--port", "8080"]
