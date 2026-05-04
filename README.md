# K Finance — V2 Premium Simple

Application PWA iPhone de gestion de finance familiale, inspirée des codes premium finance (Finary/Revolut/Apple), mais avec une identité originale.

## Nouveautés V2

- Structure ultra simplifiée : fichiers à la racine, pas de sous-dossiers compliqués.
- Design premium plus propre.
- Compatible iPhone en PWA.
- Mode clair/sombre/auto.
- Dashboard patrimoine net.
- Budget mensuel par catégories.
- Comptes et actifs.
- Objectifs familiaux.
- Import CSV Crédit Agricole amélioré.
- Service Worker pour installation en PWA.

## Structure

```txt
k-finance-v2-premium-simple/
  index.html
  style.css
  app.js
  manifest.json
  sw.js
  icon-192.png
  icon-512.png
  README.md
```

## Upload GitHub simple

1. Dézipper le fichier.
2. Ouvrir le dossier `k-finance-v2-premium-simple`.
3. Sur GitHub : Add file > Upload files.
4. Glisser tous les fichiers visibles à la racine.
5. Commit changes.

## Déploiement Netlify

- Build command : laisser vide
- Publish directory : `/` ou laisser par défaut
- Le fichier `index.html` est déjà à la racine.

## Notes

Cette V2 est une base propre, légère et facile à modifier.  
La V3 peut ajouter :
- stockage local complet,
- vraies transactions,
- catégorisation automatique avancée,
- module revente Leboncoin,
- graphiques plus poussés,
- export Excel/CSV.
