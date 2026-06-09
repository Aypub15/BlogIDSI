# Jenkins Docker setup pour BlogIDSI

Ce projet est fullstack :

- Frontend React/Vite : `FrontendBlog`
- Backend Java/Tomcat : `BackendBlog12`

Jenkins est lance avec Docker via `docker-compose.jenkins.yml`.

## Demarrer Jenkins avec Docker

Depuis la racine du projet :

```powershell
cd C:\Users\hp\Desktop\Blog
docker compose -f docker-compose.jenkins.yml up -d --build
```

Puis ouvre Jenkins :

```txt
http://localhost:8081
```

Pour recuperer le mot de passe initial Jenkins :

```powershell
docker exec blog-jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

## Image Jenkins

L'image Jenkins personnalisee est dans :

```txt
jenkins/Dockerfile
```

Elle contient :

- Jenkins LTS avec JDK 17
- Node.js 22
- npm
- les plugins Jenkins utiles pour Pipeline et Git

## Creer le job Jenkins

1. Clique `New Item`.
2. Choisis `Pipeline`.
3. Dans `Pipeline`, choisis `Pipeline script from SCM`.
4. SCM : `Git`.
5. Pour utiliser le projet local monte dans Docker, mets :

```txt
file:///workspace/blog
```

6. Branche : mets ta branche actuelle, par exemple :

```txt
*/add-auth-et-web-server
```

ou :

```txt
*/main
```

7. Script Path :

```txt
Jenkinsfile
```

8. Clique `Save`, puis `Build Now`.

## Ce que le pipeline fait

1. Checkout du code.
2. Installation frontend avec `npm ci`.
3. Build frontend avec `npm run build`.
4. Build backend avec `./mvnw -DskipTests clean package`.
5. Archive les artefacts :
   - `FrontendBlog/dist/**`
   - `BackendBlog12/target/*.war`

## Commandes utiles

Voir les logs Jenkins :

```powershell
docker logs -f blog-jenkins
```

Arreter Jenkins :

```powershell
docker compose -f docker-compose.jenkins.yml down
```

Arreter Jenkins et supprimer son volume :

```powershell
docker compose -f docker-compose.jenkins.yml down -v
```

## Note

Le lint et les tests frontend ne sont pas encore bloques dans Jenkins, car le projet contient actuellement des erreurs lint et un test base sur une ancienne categorie mock. On peut les remettre dans le pipeline apres nettoyage.
