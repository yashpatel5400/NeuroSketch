cd frontend/
npm run build
rm -rf ../backend/build
mv build ../backend/
cd ../backend/
mv build/static static/
mv build/index.html templates/
rm -rf build/
python3 app.py