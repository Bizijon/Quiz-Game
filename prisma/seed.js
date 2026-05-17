const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");
const prisma = new PrismaClient();

async function main() {
  // Create a default user
  const hashedPassword = await bcrypt.hash("1234", 10);
  const user = await prisma.user.create({
    data: {
      email: "admin@example.com",
      password: hashedPassword,
      name: "Admin User",
    },
  });

   console.log("Created user:", user.email);


const LOLQuiz = [
  {
    id: 1,
    question: "What champions ultimate ability is called 'Supreme Display of Talent' ",
    answer: "Qiyana. She sends out a shockwave that detonates whatever elements she hits with it, stunning and damaging nearby enemies",
    keywords: ["Qiyana", "element", "Ultimate", "champion","ability"]
  },
  {
    id: 2,
    question: "What champions use their own health as a resource for abilities?",
    answer: "Aatrox, Dr.Mundo, Mordekaiser, Vladimir and Zac",
    keywords: ["health", "ability", "champion", "ability"]
  },
  {
    id: 3,
    question: "How many minions in order to freeze wave?",
    answer: "You need 3 to 4 caster minions.",
    keywords: ["caster minion", "freeze"]
  },
  {
    id: 4,
    question: "What is a double cast and who can perform this?",
    answer: "Riven can perform this. Double casting is a technique that Riven can use to cast two abilities simultaneously ",
    keywords: ["Double cast", "Riven", "unique", "ability"]
  }
];

async function main() {
  await prisma.LOLQuiz.deleteMany();
  await prisma.keyword.deleteMany();

  for (const quiz of LOLQuiz) {
    await prisma.LOLQuiz.create({
      data: {
        question: quiz.question,
        answer: quiz.answer,
        userId: user.id,
        keywords: {
          connectOrCreate: quiz.keywords.map((kw) => ({
            where: { name: kw },
            create: { name: kw },
          })),
        },
      },
    });
  }

  console.log("Seed data inserted successfully");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {prisma.$disconnect()})};