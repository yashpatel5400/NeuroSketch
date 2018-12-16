cd frontend/
npm run build
rm -rf ../backend/build
mv build ../backend/
cd ../backend/
rm -rf static/
mv build/static .
mv build/index.html templates/
rm -rf build/
python3 app.py