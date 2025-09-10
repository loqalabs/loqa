# DevOps Role Prompt Library

## Infrastructure as Code Principles

### Core IaC Principles
```
1. **Version Control Everything**: All infrastructure definitions in Git
2. **Immutable Infrastructure**: Replace rather than modify
3. **Declarative Configuration**: Define desired state, not steps
4. **Environment Parity**: Consistent across dev/staging/prod
5. **Automated Testing**: Validate infrastructure changes
6. **Documentation as Code**: Keep docs with infrastructure code

Benefits:
- Reproducible environments
- Reduced configuration drift
- Faster disaster recovery
- Better compliance and auditing
```

### Infrastructure Patterns
```
**Microservice Infrastructure Pattern**
- Service discovery (Consul, etcd)
- Load balancing (nginx, HAProxy)
- Circuit breakers (Istio, Envoy)
- Distributed tracing (Jaeger, Zipkin)
- Centralized logging (ELK stack, Fluentd)
- Metrics and monitoring (Prometheus, Grafana)

**Container Orchestration**
- Container registry for image storage
- Health checks and readiness probes
- Resource limits and requests
- Secrets management
- Configuration management
- Rolling updates and rollbacks
```

## CI/CD Pipeline Design

### Pipeline Best Practices
```
Stage Organization:
1. **Source**: Code checkout and dependency caching
2. **Build**: Compile, test, package artifacts
3. **Security**: Vulnerability scanning, compliance checks
4. **Deploy**: Environment-specific deployments
5. **Verify**: Smoke tests, integration tests
6. **Monitor**: Performance and error tracking

Quality Gates:
- All tests must pass (unit, integration, e2e)
- Security scans must pass
- Code coverage thresholds met
- Performance benchmarks within limits
- Manual approval for production (if required)
```

### GitHub Actions Patterns for Loqa
```yaml
# .github/workflows/ci-cd.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        go-version: [1.21, 1.22]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: ${{ matrix.go-version }}
      - name: Run tests
        run: |
          make quality-check
          make test
          
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run security scan
        uses: securecodewarrior/github-action-add-sarif@v1
        
  deploy:
    needs: [test, security]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to staging
        run: |
          docker-compose -f docker-compose.staging.yml up -d
```

## Container and Docker Best Practices

### Dockerfile Optimization
```dockerfile
# Multi-stage build for Go services
FROM golang:1.22-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o main ./cmd

# Final image
FROM alpine:latest

# Security: Run as non-root user
RUN adduser -D -s /bin/sh appuser
USER appuser

# Copy binary and set permissions
COPY --from=builder --chown=appuser:appuser /app/main /app/main

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

EXPOSE 8080
CMD ["/app/main"]

# Best Practices Applied:
# ✅ Multi-stage build reduces image size
# ✅ Non-root user improves security  
# ✅ Health check enables container orchestration
# ✅ Minimal base image reduces attack surface
```

### Docker Compose for Local Development
```yaml
# docker-compose.yml for Loqa services
version: '3.8'

services:
  loqa-hub:
    build:
      context: ./loqa-hub
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
      - "50051:50051"
    environment:
      - DATABASE_URL=postgres://user:pass@db:5432/loqa
      - REDIS_URL=redis://redis:6379
    depends_on:
      - db
      - redis
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    restart: unless-stopped

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: loqa
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d loqa"]
      interval: 30s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:

# Features:
# ✅ Health checks for service dependencies
# ✅ Restart policies for reliability
# ✅ Volume persistence for data
# ✅ Environment variable configuration
```

## Monitoring and Observability

### Three Pillars of Observability
```
1. **Metrics**: Numerical data about system behavior
   - Application metrics: Request rate, error rate, duration
   - Infrastructure metrics: CPU, memory, disk, network
   - Business metrics: User engagement, feature usage

2. **Logs**: Detailed event records
   - Structured logging (JSON format)
   - Centralized log aggregation
   - Log levels: ERROR, WARN, INFO, DEBUG
   - Correlation IDs for tracing

3. **Traces**: Request flow through distributed system
   - Distributed tracing for microservices
   - End-to-end request visualization
   - Performance bottleneck identification
```

### Monitoring Stack Design
```
**Metrics Collection**: Prometheus + Grafana
- Prometheus for metrics collection and storage
- Grafana for visualization and alerting
- Application instrumentation with client libraries
- Service discovery for dynamic targets

**Logging**: ELK Stack (Elasticsearch, Logstash, Kibana)
- Structured logs in JSON format
- Centralized log aggregation
- Full-text search and analysis
- Log-based alerting

**Tracing**: Jaeger or Zipkin
- Distributed request tracing
- Service dependency mapping
- Performance analysis
- Error correlation
```

### Alerting Strategy
```
Alert Categories:
1. **Critical**: Service down, data loss, security breach
   - Page on-call engineer immediately
   - Example: API returning 5xx errors > 1%

2. **Warning**: Performance degradation, capacity issues
   - Notify during business hours
   - Example: Response time > 500ms for 5 minutes

3. **Info**: Deployment notifications, scheduled events
   - Send to team chat
   - Example: New release deployed successfully

Alerting Best Practices:
- Alert on symptoms, not causes
- Include runbook links in alert messages
- Set appropriate thresholds to avoid noise
- Use alert suppression to prevent spam
```

## Security and Compliance

### Security Hardening Checklist
```
**Container Security**
- [ ] Use minimal base images (alpine, distroless)
- [ ] Run containers as non-root users
- [ ] Scan images for vulnerabilities
- [ ] Keep images updated with security patches
- [ ] Use read-only root filesystems where possible

**Network Security**
- [ ] Implement network segmentation
- [ ] Use TLS for all communications
- [ ] Configure firewalls and security groups
- [ ] Monitor network traffic for anomalies
- [ ] Implement rate limiting and DDoS protection

**Access Control**
- [ ] Implement least privilege principle
- [ ] Use strong authentication (MFA where possible)
- [ ] Regular access reviews and cleanup
- [ ] Secure secrets management
- [ ] Audit logging for all access
```

### Secrets Management
```
**Production Secrets Handling**
- Use dedicated secrets management (HashiCorp Vault, AWS Secrets Manager)
- Never commit secrets to version control
- Rotate secrets regularly
- Encrypt secrets at rest and in transit
- Audit secret access

**Development Secrets**
- Use .env files for local development (gitignored)
- Provide .env.example with dummy values
- Use different secrets for each environment
- Document secret requirements clearly

Example secrets management:
# .env.example
DATABASE_URL=postgres://user:password@localhost:5432/loqa_dev
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here

# docker-compose.yml
environment:
  - DATABASE_URL=${DATABASE_URL}
  - API_KEY=${API_KEY}
```

## Performance and Scalability

### Performance Monitoring
```
Key Performance Indicators (KPIs):
- **Response Time**: 95th percentile latency < 500ms
- **Throughput**: Requests per second capacity
- **Error Rate**: < 0.1% error rate target
- **Availability**: 99.9% uptime target
- **Resource Utilization**: CPU < 70%, Memory < 80%

Performance Testing:
1. **Load Testing**: Normal expected load
2. **Stress Testing**: Beyond normal capacity
3. **Spike Testing**: Sudden traffic increases
4. **Volume Testing**: Large amounts of data
5. **Endurance Testing**: Extended periods

Tools:
- Artillery, k6, JMeter for load testing
- Prometheus for metrics collection
- Grafana for visualization
- APM tools for application monitoring
```

### Scaling Strategies
```
**Vertical Scaling (Scale Up)**
- Increase CPU, memory, storage
- Simpler to implement
- Limited by hardware constraints
- Single point of failure

**Horizontal Scaling (Scale Out)**
- Add more instances
- Better fault tolerance
- Complexity in load distribution
- Requires stateless services

**Auto-scaling Configuration**
# Kubernetes HPA example
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: loqa-hub-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: loqa-hub
  minReplicas: 2
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
```

## Backup and Disaster Recovery

### Backup Strategy
```
**Data Classification**:
1. **Critical**: Must be backed up (user data, configurations)
2. **Important**: Should be backed up (logs, metrics)
3. **Disposable**: Can be recreated (cache, temporary files)

**Backup Types**:
- Full backups: Complete data snapshot
- Incremental backups: Changes since last backup
- Differential backups: Changes since last full backup

**Testing Backup Recovery**:
- Regular restore testing (monthly)
- Document recovery procedures
- Measure recovery time objectives (RTO)
- Measure recovery point objectives (RPO)
```

### Disaster Recovery Planning
```
**Recovery Scenarios**:
1. **Service Failure**: Single service goes down
   - Auto-restart with orchestration
   - Health checks and circuit breakers

2. **Infrastructure Failure**: Server or zone failure
   - Multi-zone deployment
   - Load balancing across zones

3. **Data Center Failure**: Complete facility loss
   - Multi-region backup
   - DNS failover
   - Data replication

**Recovery Procedures**:
- Incident response playbook
- Communication plan
- Step-by-step recovery guide
- Post-incident review process
```

## Infrastructure Automation

### Terraform Best Practices
```hcl
# terraform/main.tf
terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Use modules for reusability
module "loqa_cluster" {
  source = "./modules/k8s-cluster"
  
  cluster_name     = var.cluster_name
  node_instance_type = var.node_instance_type
  min_nodes        = var.min_nodes
  max_nodes        = var.max_nodes
  
  tags = {
    Environment = var.environment
    Project     = "loqa"
  }
}

# Best Practices:
# ✅ Pin provider versions
# ✅ Use modules for reusability
# ✅ Tag all resources
# ✅ Use variables for flexibility
# ✅ State backend configuration
```

### Ansible Playbooks
```yaml
# ansible/deploy-loqa.yml
---
- name: Deploy Loqa Services
  hosts: loqa_servers
  become: yes
  
  vars:
    docker_compose_version: "2.20.0"
    loqa_version: "{{ lookup('env', 'LOQA_VERSION') | default('latest') }}"
  
  tasks:
    - name: Update system packages
      apt:
        update_cache: yes
        upgrade: yes
      
    - name: Install Docker and Docker Compose
      apt:
        name:
          - docker.io
          - docker-compose-plugin
        state: present
        
    - name: Deploy Loqa services
      docker_compose:
        project_src: /opt/loqa
        state: present
        pull: yes
      notify: restart loqa services
      
  handlers:
    - name: restart loqa services
      docker_compose:
        project_src: /opt/loqa
        restarted: yes
```

## Troubleshooting Methodologies

### Incident Response Process
```
1. **Detection**: Monitoring alerts, user reports
2. **Assessment**: Determine severity and impact
3. **Response**: Immediate actions to restore service
4. **Investigation**: Root cause analysis
5. **Resolution**: Permanent fix implementation
6. **Follow-up**: Post-incident review and improvements

Severity Levels:
- P1 (Critical): Service completely down, security breach
- P2 (High): Major functionality impaired, performance degraded
- P3 (Medium): Minor functionality issues, some users affected
- P4 (Low): Cosmetic issues, planned maintenance
```

### Debugging Distributed Systems
```
**Common Issues**:
1. **Network Issues**: Timeouts, connectivity problems
   - Check network policies and firewall rules
   - Verify DNS resolution
   - Test connectivity between services

2. **Resource Exhaustion**: Memory leaks, CPU spikes
   - Monitor resource usage trends
   - Check for memory leaks in applications
   - Analyze CPU usage patterns

3. **Configuration Issues**: Wrong settings, missing env vars
   - Validate configuration against documentation
   - Check environment variable injection
   - Compare working vs broken configurations

**Debugging Tools**:
- kubectl for Kubernetes troubleshooting
- docker logs for container debugging
- tcpdump/wireshark for network analysis
- strace/ltrace for system call tracing
```

## Cost Optimization

### Cloud Cost Management
```
**Cost Optimization Strategies**:
1. **Right-sizing**: Match resources to actual usage
2. **Reserved Instances**: Commit to long-term usage for discounts
3. **Spot Instances**: Use interruptible instances for batch jobs
4. **Auto-scaling**: Scale resources based on demand
5. **Storage Optimization**: Use appropriate storage tiers

**Monitoring and Alerting**:
- Set up billing alerts for unexpected costs
- Regular cost reviews and optimization opportunities
- Tag resources for cost allocation and tracking
- Use cost monitoring tools and dashboards

**Resource Lifecycle Management**:
- Automate cleanup of temporary resources
- Schedule shutdown of development environments
- Regular audit of unused resources
- Implement resource tagging strategies
```