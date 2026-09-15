import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function todayAt(h: number, m = 0) {
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

function tomorrowAt(h: number, m = 0) {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(h, m, 0, 0);
  return d;
}

async function main() {
  await prisma.reservation.deleteMany();
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

  const seller4 = await prisma.user.create({
    data: {
      email: "hotel@xale.mn",
      passwordHash,
      name: "UB Сити зочид буудал",
      phone: "77001122",
      whatsapp: "77001122",
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

  const bags = [
    {
      title: "Талх, нарийн боовны Surprise Bag",
      category: "BAKERY",
      description:
        "Өнөөдрийн үлдэгдэл талх, круассан, жигнэмэг холимог. Яг агуулга нь өдөр бүр өөр — Surprise Bag!",
      bagPrice: 5000,
      estimatedRetailValue: 18000,
      quantityAvailable: 8,
      pickupStart: todayAt(18, 0),
      pickupEnd: todayAt(20, 30),
      pickupDistrict: "Сүхбаатар",
      pickupAddress: "СБД, 1-р хороо, Талхны дэлгүүр",
      dietaryNotes: "Глютен агуулсан байж болно",
      photoUrl:
        "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600",
      status: "ACTIVE",
      sellerId: seller3.id,
    },
    {
      title: "Кафены өдрийн Surprise Bag",
      category: "CAFE",
      description:
        "Сэндвич, салат, жигнэмэг эсвэл кофены дагалдах бүтээгдэхүүн. Агуулга өдөр бүр өөрчлөгдөнө.",
      bagPrice: 6000,
      estimatedRetailValue: 20000,
      quantityAvailable: 5,
      pickupStart: todayAt(17, 30),
      pickupEnd: todayAt(19, 30),
      pickupDistrict: "Сүхбаатар",
      pickupAddress: "СБД төв, Улаанбаатар кафе",
      dietaryNotes: "Цагаан хоолны сонголт байж болно",
      photoUrl:
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600",
      status: "ACTIVE",
      sellerId: seller2.id,
    },
    {
      title: "Рестораны оройн Surprise Bag",
      category: "RESTAURANT",
      description:
        "Өдрийн цэсний үлдэгдэл хоол — 1–2 хүнд хүрэлцэх Surprise Bag. Яг цэс нь нууц!",
      bagPrice: 12000,
      estimatedRetailValue: 35000,
      quantityAvailable: 4,
      pickupStart: todayAt(20, 0),
      pickupEnd: todayAt(21, 30),
      pickupDistrict: "Хан-Уул",
      pickupAddress: "ХУД, ресторан хаалганы ойр",
      dietaryNotes: "Махтай байж болно",
      photoUrl:
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600",
      status: "ACTIVE",
      sellerId: seller2.id,
    },
    {
      title: "Хүнсний дэлгүүрийн Surprise Bag",
      category: "GROCERY",
      description:
        "Хугацаа ойртож буй сүүн бүтээгдэхүүн, жимс, ногоо холимог. Агуулга өдөр бүр өөр.",
      bagPrice: 8000,
      estimatedRetailValue: 25000,
      quantityAvailable: 6,
      pickupStart: tomorrowAt(10, 0),
      pickupEnd: tomorrowAt(12, 0),
      pickupDistrict: "Баянзүрх",
      pickupAddress: "БЗД, Номин дэлгүүр касс 2",
      dietaryNotes: "Хөргөгчинд хадгална",
      photoUrl:
        "https://images.unsplash.com/photo-1542838132-92c53300491e?w=600",
      status: "ACTIVE",
      sellerId: seller1.id,
    },
    {
      title: "Зочид буудлын өглөөний Surprise Bag",
      category: "HOTEL",
      description:
        "Буфет өглөөний үлдэгдэл — жигнэмэг, жимс, сэндвич гэх мэт. Surprise Bag агуулга өөрчлөгдөнө.",
      bagPrice: 10000,
      estimatedRetailValue: 30000,
      quantityAvailable: 3,
      pickupStart: tomorrowAt(9, 0),
      pickupEnd: tomorrowAt(11, 0),
      pickupDistrict: "Чингэлтэй",
      pickupAddress: "ЧД, UB Сити зочид буудал лобби",
      dietaryNotes: null,
      photoUrl:
        "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600",
      status: "ACTIVE",
      sellerId: seller4.id,
    },
    {
      title: "Бялуу, нарийн боовны оройн Bag",
      category: "BAKERY",
      description:
        "Төрсөн өдөр / захиалгын үлдэгдэл бялуу, жигнэмэг. Яг төрөл нь Surprise!",
      bagPrice: 7000,
      estimatedRetailValue: 22000,
      quantityAvailable: 2,
      pickupStart: todayAt(19, 0),
      pickupEnd: todayAt(21, 0),
      pickupDistrict: "Баянгол",
      pickupAddress: "БГД, Талхны салбар",
      dietaryNotes: "Сахар ихтэй байж болно",
      photoUrl:
        "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600",
      status: "ACTIVE",
      sellerId: seller3.id,
    },
  ];

  for (const bag of bags) {
    await prisma.listing.create({ data: bag });
  }

  console.log("✅ Seed амжилттай! Surprise Bags бэлэн.");
  console.log("Demo бүртгэлүүд (нууц үг: demo1234):");
  console.log("  Худалдагч: seller@xale.mn");
  console.log("  Кафе:      cafe@xale.mn");
  console.log("  Талх:      bakery@xale.mn");
  console.log("  Буудал:    hotel@xale.mn");
  console.log("  Худалдан авагч: buyer@xale.mn");
  console.log(`  Нийт Surprise Bag: ${bags.length}`);
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
