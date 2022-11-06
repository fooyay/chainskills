rsync -r src/ docs/
rsync build/contracts/ChainList.json docs/
git add .
git commit -m "add frontend files to GitHub pages"
git push
