pipeline {
    agent any

    environment {
        // Must match the JDK 17 name configured in Jenkins > Tools > JDK
        JAVA_HOME  = tool 'JDK17'
        // Must match the Maven name configured in Jenkins > Tools > Maven
        MAVEN_HOME = tool 'Maven3'
        PATH       = "${JAVA_HOME}/bin:${MAVEN_HOME}/bin:${env.PATH}"

        APP_NAME    = 'task-manager'
        APP_VERSION = '1.0.0'

        // Spring datasource overrides so tests don't need a real PostgreSQL instance.
        // Jenkins will use an in-memory H2 database during the Test stage.
        // These env vars are picked up automatically by Spring Boot's test context.
        SPRING_DATASOURCE_URL      = 'jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;MODE=PostgreSQL'
        SPRING_DATASOURCE_DRIVER   = 'org.h2.Driver'
        SPRING_DATASOURCE_USERNAME = 'sa'
        SPRING_DATASOURCE_PASSWORD = ''
        SPRING_JPA_DATABASE        = 'h2'

        // Dummy JWT secret for tests — never commit real secrets to source control
        JWT_SECRET = 'jenkins-ci-dummy-secret-32-chars!!'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timeout(time: 20, unit: 'MINUTES')
        disableConcurrentBuilds()
        timestamps()
    }

    stages {

        // ──────────────────────────────────────────
        // STAGE 1: Checkout
        // Pulls your TaskManager repo from GitHub.
        // ──────────────────────────────────────────
        stage('Checkout') {
            steps {
                echo "Checking out AlexDorinIrimia/TaskManager..."
                checkout scm
            }
        }

        // ──────────────────────────────────────────
        // STAGE 2: Build
        // Compiles the Spring Boot app with Maven.
        // -DskipTests here — tests run in Stage 3.
        // The spring-boot-maven-plugin produces a
        // fat JAR (task-manager-1.0.0.jar) in target/.
        // ──────────────────────────────────────────
        stage('Build') {
            steps {
                echo "Building ${APP_NAME} v${APP_VERSION}..."
                sh 'mvn clean package -DskipTests'
            }
            post {
                success {
                    echo "Build successful! Archiving artifact..."
                    // Archives the fat JAR — visible in Jenkins under 'Build Artifacts'
                    archiveArtifacts artifacts: 'target/*.jar', fingerprint: true
                }
                failure {
                    echo "Build failed. Check for compilation errors above."
                }
            }
        }

        // ──────────────────────────────────────────
        // STAGE 3: Test
        // Runs Spring Boot tests against H2 in-memory
        // DB so no real PostgreSQL is needed in CI.
        //
        // NOTE: Add this dependency to your pom.xml
        // so Spring Boot can use H2 during tests:
        //
        //   <dependency>
        //     <groupId>com.h2database</groupId>
        //     <artifactId>h2</artifactId>
        //     <scope>test</scope>
        //   </dependency>
        //
        // ──────────────────────────────────────────
        stage('Test') {
            steps {
                echo "Running unit & integration tests..."
                sh '''
                    mvn test \
                        -Dspring.datasource.url=${SPRING_DATASOURCE_URL} \
                        -Dspring.datasource.driver-class-name=${SPRING_DATASOURCE_DRIVER} \
                        -Dspring.datasource.username=${SPRING_DATASOURCE_USERNAME} \
                        -Dspring.datasource.password=${SPRING_DATASOURCE_PASSWORD} \
                        -Dspring.jpa.database-platform=org.hibernate.dialect.H2Dialect \
                        -Djwt.secret=${JWT_SECRET}
                '''
            }
            post {
                always {
                    // Publishes JUnit XML results — shows a test trend graph in Jenkins
                    junit '**/target/surefire-reports/*.xml'
                }
                success {
                    echo "All tests passed!"
                }
                failure {
                    echo "Some tests failed. Check the Test Results tab for details."
                }
            }
        }

        // ──────────────────────────────────────────
        // STAGE 4: Verify
        // Runs the full Maven verify lifecycle which
        // covers integration tests and any plugins
        // bound to the verify phase (e.g. JaCoCo).
        // ──────────────────────────────────────────
        stage('Verify') {
            steps {
                echo "Running Maven verify (integration tests + coverage)..."
                sh '''
                    mvn verify \
                        -DskipUnitTests=true \
                        -Dspring.datasource.url=${SPRING_DATASOURCE_URL} \
                        -Dspring.datasource.driver-class-name=${SPRING_DATASOURCE_DRIVER} \
                        -Dspring.datasource.username=${SPRING_DATASOURCE_USERNAME} \
                        -Dspring.datasource.password=${SPRING_DATASOURCE_PASSWORD} \
                        -Dspring.jpa.database-platform=org.hibernate.dialect.H2Dialect \
                        -Djwt.secret=${JWT_SECRET}
                '''
            }
            post {
                always {
                    echo "Verify stage complete."
                }
            }
        }

    } // end stages

    post {
        success {
            echo "Pipeline passed for ${APP_NAME} v${APP_VERSION}!"
        }
        failure {
            echo "Pipeline FAILED for ${APP_NAME}. Review the logs above."
        }
        always {
            cleanWs()
        }
    }

}
