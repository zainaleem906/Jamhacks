import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const achievements = [
  {
    slug: "first-pickup",
    name: "First Pickup",
    description: "Pick up your very first piece of litter",
    icon: "🌱",
    xpReward: 50,
    pointReward: 5,
  },
  {
    slug: "ten-items",
    name: "Recycler",
    description: "Collect 10 items total",
    icon: "♻️",
    xpReward: 100,
    pointReward: 20,
  },
  {
    slug: "fifty-items",
    name: "Eco Warrior",
    description: "Collect 50 items total",
    icon: "⚔️",
    xpReward: 250,
    pointReward: 50,
  },
  {
    slug: "hundred-items",
    name: "Cleanup Hero",
    description: "Collect 100 items total",
    icon: "🦸",
    xpReward: 500,
    pointReward: 100,
  },
  {
    slug: "five-hundred-items",
    name: "Planet Guardian",
    description: "Collect 500 items total",
    icon: "🌍",
    xpReward: 1000,
    pointReward: 250,
  },
  {
    slug: "three-day-streak",
    name: "On a Roll",
    description: "Maintain a 3-day cleanup streak",
    icon: "🔥",
    xpReward: 150,
    pointReward: 30,
  },
  {
    slug: "seven-day-streak",
    name: "Week Warrior",
    description: "Maintain a 7-day cleanup streak",
    icon: "📅",
    xpReward: 350,
    pointReward: 75,
  },
  {
    slug: "thirty-day-streak",
    name: "Habit Hero",
    description: "Maintain a 30-day cleanup streak",
    icon: "🏆",
    xpReward: 1500,
    pointReward: 300,
  },
  {
    slug: "bottle-collector",
    name: "Bottle Collector",
    description: "Collect 25 plastic bottles",
    icon: "🍾",
    xpReward: 200,
    pointReward: 40,
  },
  {
    slug: "bag-buster",
    name: "Bag Buster",
    description: "Collect 10 plastic bags",
    icon: "🛍️",
    xpReward: 200,
    pointReward: 40,
  },
  {
    slug: "community-hero",
    name: "Community Hero",
    description: "Reach the top 10 on the leaderboard",
    icon: "👑",
    xpReward: 500,
    pointReward: 100,
  },
  {
    slug: "speed-cleaner",
    name: "Speed Cleaner",
    description: "Collect 5 items in under 2 minutes",
    icon: "⚡",
    xpReward: 150,
    pointReward: 25,
  },
];

async function main() {
  console.log("Seeding achievements...");
  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { slug: achievement.slug },
      update: achievement,
      create: achievement,
    });
  }
  console.log(`Seeded ${achievements.length} achievements.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
