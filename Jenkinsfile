pipeline {
    agent any

    environment {
        APP_NAME    = 'task-manager'
        APP_VERSION = '1.0.0'
        IMAGE_NAME  = "taskmanager/${APP_NAME}"

        // ── Test database config ──────────────────────────────────
        // Your tests use pure Mockito (no @SpringBootTest),
        // so no real DB is needed. These are just passed in case
        // any test context spins up — H2 is already in your pom.xml.
        SPRING_DATASOURCE_URL      = 'jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL'
        SPRING_DATASOURCE_DRIVER   = 'org.h2.Driver'
        SPRING_DATASOURCE_USERNAME = 'sa'
        SPRING_DATASOURCE_PASSWORD = ''

        // ── JWT secret ────────────────────────────────────────────
        // Matches @Value("${app.jwtSecret}") in JwtTokenProvider.java
        // Must be at least 64 chars for HS512
        JWT_SECRET = 'jenkins-ci-test-secret-key-minimum-64-characters-long-for-hs512!!'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    stages {

        // ──────────────────────────────────────────────────────────
        // STAGE 1: Checkout
        // Jenkins pulls the repo automatically via 'Pipeline from SCM'.
        // ──────────────────────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "Checking out TaskManager..."
                checkout scm
            }
        }

        // ──────────────────────────────────────────────────────────
        // STAGE 2: Build & Test
        // Runs inside the official Maven+JDK17 Docker image so
        // Jenkins doesn't need Java or Maven installed locally.
        //
        // Your tests (TaskServiceTest, ProjectServiceTest, etc.)
        // use Mockito only — no DB, no Spring context startup.
        // ──────────────────────────────────────────────────────────
        stage('Build & Test') {
            agent {
                docker {
                    image 'maven:3.9.6-eclipse-temurin-17'
                    // Persist the Maven local repo between builds for speed
                    args '-v maven-repo-cache:/root/.m2'
                    reuseNode true
                }
            }
            steps {
                echo "Compiling and running tests..."
                sh """
                    mvn clean verify \
                        -Dspring.datasource.url=${SPRING_DATASOURCE_URL} \
                        -Dspring.datasource.driver-class-name=${SPRING_DATASOURCE_DRIVER} \
                        -Dspring.datasource.username=${SPRING_DATASOURCE_USERNAME} \
                        -Dspring.datasource.password=${SPRING_DATASOURCE_PASSWORD} \
                        -Dspring.jpa.database-platform=org.hibernate.dialect.H2Dialect \
                        -Dapp.jwtSecret=${JWT_SECRET} \
                        -B
                """
            }
            post {
                always {
                    // Publish JUnit results — Jenkins shows pass/fail trend graph
                    // Your surefire XMLs are already in target/surefire-reports/
                    junit '**/target/surefire-reports/*.xml'
                }
                success {
                    // Archive the fat JAR — downloadable from Jenkins UI
                    archiveArtifacts artifacts: 'target/task-manager-1.0.0.jar', fingerprint: true
                    echo "Build & tests passed!"
                }
                failure {
                    echo "Build or tests failed. Check the console output above."
                }
            }
        }

        // ──────────────────────────────────────────────────────────
        // STAGE 3: Build Docker Image
        // Builds the production Docker image using your Dockerfile.
        // Jenkins can do this because docker.sock is mounted in the
        // Jenkins container (configured in docker-compose.yml).
        // ──────────────────────────────────────────────────────────
        stage('Build Docker Image') {
            steps {
                echo "Building Docker image: ${IMAGE_NAME}:${APP_VERSION}..."
                script {
                    docker.build("${IMAGE_NAME}:${APP_VERSION}", ".")
                    docker.build("${IMAGE_NAME}:latest", ".")
                }
            }
            post {
                success {
                    echo "Image built: ${IMAGE_NAME}:${APP_VERSION}"
                }
                failure {
                    echo "Docker image build failed."
                }
            }
        }

        // ──────────────────────────────────────────────────────────
        // STAGE 4: Security Scan
        // Trivy scans the Docker image for known CVEs.
        // --exit-code 0 means the pipeline won't fail on findings —
        // change to 1 if you want CRITICAL vulnerabilities to fail CI.
        // ──────────────────────────────────────────────────────────
        stage('Security Scan') {
            steps {
                echo "Scanning ${IMAGE_NAME}:${APP_VERSION} for vulnerabilities..."
                sh """
                    docker run --rm \
                        -v /var/run/docker.sock:/var/run/docker.sock \
                        aquasec/trivy:latest image \
                        --exit-code 0 \
                        --severity HIGH,CRITICAL \
                        --no-progress \
                        ${IMAGE_NAME}:${APP_VERSION}
                """
            }
            post {
                always {
                    echo "Security scan complete."
                }
            }
        }

    } // end stages

    post {
        success {
            echo "Pipeline passed! ${IMAGE_NAME}:${APP_VERSION} is ready."
        }
        failure {
            echo "Pipeline FAILED for ${APP_NAME}. Review the logs above."
        }
        always {
            sh 'docker image prune -f || true'
            cleanWs()
        }
    }

}
