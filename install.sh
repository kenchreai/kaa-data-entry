cd public &&
npm install &&
cd ../ &&
gulp build &&
rm -r node_modules &&
rm -r src &&
rm -r test &&
cd public &&
rm -r node_modules
