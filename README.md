# POS-Cafe

ระบบ POS + Self-Order สำหรับร้านคาเฟ่

## วิธีติดตั้ง
```bash
git clone https://github.com/thisyodev/POS-Cafe.git
cd POS-Cafe
docker-compose up -d --build
```

## Database Migration + Seed
```bash
docker exec -it pos-cafe-backend-1 npm run migrate
docker exec -it pos-cafe-backend-1 npm run seed
```

## การเข้าใช้งาน
- POS Frontend: http://localhost:3000
- Customer Order: http://localhost:3001
- Backend API: http://localhost:5000/api
