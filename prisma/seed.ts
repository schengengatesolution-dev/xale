import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.interest.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("demo1234", 10);

  const seller1 = await prisma.user.create({
    data: {
      email: "seller@xale.mn",
      passwordHash,
      name: "Номин дэлгүүр",
      phone: "99112233",
      whatsapp: "99112233",
      role: "SELLER",
    },
  });

  const seller2 = await prisma.user.create({
    data: {
      email: "cafe@xale.mn",
      passwordHash,
      name: "Улаанбаатар кафе",
      phone: "88114455",
      whatsapp: "88114455",
      role: "SELLER",
    },
  });

  const seller3 = await prisma.user.create({
    data: {
      email: "bakery@xale.mn",
      passwordHash,
      name: "Талхны дэлгүүр",
      phone: "99001122",
      whatsapp: "99001122",
      role: "SELLER",
    },
  });

  const buyer1 = await prisma.user.create({
    data: {
      email: "buyer@xale.mn",
      passwordHash,
      name: "Батбаяр",
      phone: "99887766",
      whatsapp: "99887766",
      role: "BUYER",
    },
  });

  const buyer2 = await prisma.user.create({
    data: {
      email: "farm@xale.mn",
      passwordHash,
      name: "Гахайн ферм ХХК",
      phone: "95112233",
      whatsapp: "95112233",
      role: "BUYER",
    },
  });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const day2 = new Date();
  day2.setDate(day2.getDate() + 2);
  const day3 = new Date();
  day3.setDate(day3.getDate() + 3);
  const day5 = new Date();
  day5.setDate(day5.getDate() + 5);
  const today = new Date();
  today.setHours(23, 59, 0, 0);

  const listings = [
    {
      title: "Сүү 1л — дуусах дөхсөн",
      category: "FOOD",
      description:
        "Өнөөдөр дуусах сүү. Хөргөгчинд хадгалсан, чанар сайтай. Бөөндөөр авах боломжтой.",
      originalPrice: 4500,
      discountPrice: 2000,
      quantity: 24,
      unit: "ширхэг",
      expiryDate: today,
      pickupDistrict: "Баянзүрх",
      photoUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=600",
      status: "ACTIVE",
      sellerId: seller1.id,
    },
    {
      title: "Талх, бялуу — өнөөдрийн үлдэгдэл",
      category: "FOOD",
      description:
        "Өнөөдөр жигнэсэн талх, бялууны үлдэгдэл. Орой 20:00-оос хойш авч болно.",
      originalPrice: 8000,
      discountPrice: 3000,
      quantity: 15,
      unit: "ширхэг",
      expiryDate: today,
      pickupDistrict: "Сүхбаатар",
      photoUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
      status: "ACTIVE",
      sellerId: seller3.id,
    },
    {
      title: "Рестораны бэлэн хоол — өдрийн үлдэгдэл",
      category: "RESTAURANT_SURPLUS",
      description:
        "Өдрийн цэсний үлдэгдэл хоол. 5–6 порц. Халуун авчрах боломжтой. Гахайн фермд ч тохиромжтой.",
      originalPrice: 25000,
      discountPrice: 8000,
      quantity: 6,
      unit: "порц",
      expiryDate: today,
      pickupDistrict: "Хан-Уул",
      photoUrl: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
      status: "ACTIVE",
      sellerId: seller2.id,
    },
    {
      title: "Йогурт багц — 2 хоногийн дотор",
      category: "FOOD",
      description: "Грек йогурт 400г. 12 ширхэг. Хугацаа 2 хоногийн дараа дуусна.",
      originalPrice: 6500,
      discountPrice: 3000,
      quantity: 12,
      unit: "ширхэг",
      expiryDate: day2,
      pickupDistrict: "Баянгол",
      photoUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600",
      status: "ACTIVE",
      sellerId: seller1.id,
    },
    {
      title: "Жимс, ногооны үлдэгдэл",
      category: "FOOD",
      description:
        "Алим, банана, лууван, байцаа холимог. Гадаад төрх бага зэрэг муудсан боловч идэхэд тохиромжтой.",
      originalPrice: 15000,
      discountPrice: 5000,
      quantity: 1,
      unit: "хайрцаг",
      expiryDate: tomorrow,
      pickupDistrict: "Чингэлтэй",
      photoUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600",
      status: "ACTIVE",
      sellerId: seller1.id,
    },
    {
      title: "Кафены сэндвич, салат",
      category: "RESTAURANT_SURPLUS",
      description:
        "Өдрийн сэндвич, салатны үлдэгдэл. 8 порц. Орой 18:00–20:00 хооронд аваарай.",
      originalPrice: 12000,
      discountPrice: 4000,
      quantity: 8,
      unit: "порц",
      expiryDate: today,
      pickupDistrict: "Сүхбаатар",
      photoUrl: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
      status: "ACTIVE",
      sellerId: seller2.id,
    },
    {
      title: "Өндөг 30 ширхэг — дуусах дөхсөн",
      category: "FOOD",
      description: "Шинэ өндөг. Хугацаа 3 хоногийн дараа. Бөөндөөр хямд.",
      originalPrice: 18000,
      discountPrice: 10000,
      quantity: 3,
      unit: "хайрцаг",
      expiryDate: day3,
      pickupDistrict: "Сонгинохайрхан",
      photoUrl: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=600",
      status: "ACTIVE",
      sellerId: seller1.id,
    },
    {
      title: "Бялууны үлдэгдэл — том хэсэг",
      category: "FOOD",
      description:
        "Төрсөн өдрийн бялууны үлдэгдэл. 2 кг орчим. Хөргөгчинд хадгална.",
      originalPrice: 45000,
      discountPrice: 15000,
      quantity: 1,
      unit: "ширхэг",
      expiryDate: tomorrow,
      pickupDistrict: "Баянзүрх",
      photoUrl: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
      status: "ACTIVE",
      sellerId: seller3.id,
    },
    {
      title: "Махны яс, үлдэгдэл — фермд",
      category: "OTHER",
      description:
        "Рестораны махны яс, үлдэгдэл. Гахайн/нохойн хоолонд тохиромжтой. Өдөр бүр бэлэн.",
      originalPrice: 5000,
      discountPrice: 1000,
      quantity: 10,
      unit: "кг",
      expiryDate: tomorrow,
      pickupDistrict: "Хан-Уул",
      photoUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600",
      status: "ACTIVE",
      sellerId: seller2.id,
    },
    {
      title: "Гурил, гоймон — хугацаа ойртож байна",
      category: "FOOD",
      description: "Гурил 5кг, гоймон багц. Хугацаа 5 хоногийн дараа дуусна.",
      originalPrice: 22000,
      discountPrice: 12000,
      quantity: 5,
      unit: "багц",
      expiryDate: day5,
      pickupDistrict: "Баянгол",
      photoUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=600",
      status: "ACTIVE",
      sellerId: seller1.id,
    },
    {
      title: "Кофе, жигнэмэг — өдрийн үлдэгдэл",
      category: "RESTAURANT_SURPLUS",
      description:
        "Кафены өдрийн жигнэмэг, круассан үлдэгдэл. 20 ширхэг. Хямд үнээр.",
      originalPrice: 5000,
      discountPrice: 1500,
      quantity: 20,
      unit: "ширхэг",
      expiryDate: today,
      pickupDistrict: "Чингэлтэй",
      photoUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
      status: "ACTIVE",
      sellerId: seller2.id,
    },
    {
      title: "Шөл, хоолны үлдэгдэл — том сав",
      category: "RESTAURANT_SURPLUS",
      description:
        "Өдрийн шөл, хоолны үлдэгдэл 5 литр. Фермд эсвэл олон хүнд тохиромжтой.",
      originalPrice: 30000,
      discountPrice: 5000,
      quantity: 1,
      unit: "сав",
      expiryDate: today,
      pickupDistrict: "Сүхбаатар",
      photoUrl: "https://images.unsplash.com/photo-1547592166-23ac45744acd?w=600",
      status: "ACTIVE",
      sellerId: seller2.id,
    },
  ];

  for (const listing of listings) {
    await prisma.listing.create({ data: listing });
  }

  console.log("✅ Seed амжилттай!");
  console.log("Demo бүртгэлүүд:");
  console.log("  Худалдагч: seller@xale.mn / demo1234");
  console.log("  Кафе:      cafe@xale.mn / demo1234");
  console.log("  Талх:      bakery@xale.mn / demo1234");
  console.log("  Худалдан авагч: buyer@xale.mn / demo1234");
  console.log("  Ферм:      farm@xale.mn / demo1234");
  console.log(`  Нийт зарууд: ${listings.length}`);
  void buyer1;
  void buyer2;
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
