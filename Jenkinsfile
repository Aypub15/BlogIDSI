pipeline {
    agent any

    environment {
        FRONTEND_DIR = 'FrontendBlog'
        BACKEND_DIR = 'BackendBlog12'
        VITE_API_URL = 'http://127.0.0.1:8080/blog/api'
        JAVA_HOME = '/opt/java/openjdk'
        PATH+JAVA = '/opt/java/openjdk/bin'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Prepare Docker Workspace') {
            steps {
                sh '''
                    if [ -d /workspace/blog/FrontendBlog ] && [ -d /workspace/blog/BackendBlog12 ]; then
                        rm -rf FrontendBlog BackendBlog12
                        tar \
                            --exclude='.git' \
                            --exclude='node_modules' \
                            --exclude='dist' \
                            --exclude='target' \
                            -C /workspace/blog \
                            -cf - FrontendBlog BackendBlog12 | tar -xf -
                    fi
                '''
            }
        }

        stage('Frontend - Install') {
            steps {
                dir(env.FRONTEND_DIR) {
                    sh 'npm ci'
                }
            }
        }

        stage('Frontend - Build') {
            steps {
                dir(env.FRONTEND_DIR) {
                    sh 'npm run build'
                }
            }
        }

        stage('Backend - Build') {
            steps {
                dir(env.BACKEND_DIR) {
                    sh 'chmod +x mvnw'
                    sh './mvnw -DskipTests clean package'
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: '**/target/surefire-reports/*.xml'
        }
        success {
            archiveArtifacts artifacts: 'FrontendBlog/dist/**, BackendBlog12/target/*.war', fingerprint: true
        }
        cleanup {
            cleanWs deleteDirs: true, disableDeferredWipeout: true
        }
    }
}
