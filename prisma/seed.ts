import { faker } from '@faker-js/faker';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { Position, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient({
  adapter: new PrismaMariaDb({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  }),
});

async function main() {
  // drop existing data
  await prisma.workScheduleDay.deleteMany();
  await prisma.workSchedule.deleteMany();
  await prisma.user.deleteMany();
  await prisma.position.deleteMany();
  await prisma.division.deleteMany();
  await prisma.role.deleteMany();

  // seed workshcedules
  const workScheduleNames = ['Shift Pagi', 'Shift Siang'];
  const workSchedules = await Promise.all(
    workScheduleNames.map((name) =>
      prisma.workSchedule.create({
        data: {
          name,
          description: `Jadwal kerja untuk ${name.toLowerCase()}`,
          startTime: name === 'Shift Pagi' ? '08:00' : '14:00',
          endTime: name === 'Shift Pagi' ? '16:00' : '22:00',
          lateToleranceMinutes: 15,
        },
      }),
    ),
  );
  console.log(
    'Seeded work schedules:',
    workSchedules.map((ws) => ws.name),
  );

  // assign work schedules to working days
  const daysOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  for (let i = 0; i < daysOfWeek.length; i++) {
    if (i == 0 || i == 6) {
      // assign Shift Siang to weekends
      const workingsheduleday = await prisma.workScheduleDay.create({
        data: {
          dayOfWeek: i,
          workScheduleId: workSchedules.find((ws) => ws.name === 'Shift Siang')!
            .id,
        },
      });

      console.log(
        `Assigned work shedule 'Shift Siang' to ${daysOfWeek[i]} with id ${workingsheduleday.id}`,
      );
    } else {
      // weekdays ada shift pagi dan shift siang
      const morningSchedule = await prisma.workScheduleDay.create({
        data: {
          dayOfWeek: i,
          workScheduleId: workSchedules.find((ws) => ws.name === 'Shift Pagi')!
            .id,
        },
      });

      const afternoonSchedule = await prisma.workScheduleDay.create({
        data: {
          dayOfWeek: i,
          workScheduleId: workSchedules.find((ws) => ws.name === 'Shift Siang')!
            .id,
        },
      });

      console.log(
        `Assigned work shedule 'Shift Pagi' to ${daysOfWeek[i]} with id ${morningSchedule.id}`,
      );
      console.log(
        `Assigned work shedule 'Shift Siang' to ${daysOfWeek[i]} with id ${afternoonSchedule.id}`,
      );
    }
  }

  // seed divisions
  const divisionNames = [
    'IT',
    'HR',
    'Finance',
    'Marketing',
    'Sales',
    'Operations',
  ];

  const divisions = await Promise.all(
    divisionNames.map((name) =>
      prisma.division.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  console.log(
    'Seeded divisions:',
    divisions.map((div) => div.name),
  );

  // seed positions per divisions
  const positionsData: Record<string, string[]> = {
    IT: ['Software Engineer', 'System Administrator', 'DevOps Engineer'],
    HR: ['HR Manager', 'Recruiter'],
    Finance: ['Financial Analyst', 'Accountant'],
    Marketing: ['Marketing Manager', 'Content Strategist'],
    Sales: ['Sales Representative', 'Account Manager'],
    Operations: ['Operations Manager', 'Logistics Coordinator'],
  };

  const positions: Position[] = [];

  for (const division of divisions) {
    const postitionNames = positionsData[division.name] || [];
    for (const name of postitionNames) {
      const position = await prisma.position.upsert({
        where: { name: name },
        update: {},
        create: { name: name, divisionId: division.id },
      });

      positions.push(position);
    }
  }

  console.log(
    'Seeded positions:',
    positions.map((pos) => `${pos.name} (${pos.divisionId})`),
  );

  // seed roles
  const roleNames = ['HR', 'Employee'];

  const roles = await Promise.all(
    roleNames.map((name) =>
      prisma.role.upsert({
        where: { name },
        update: {},
        create: { name },
      }),
    ),
  );

  console.log(
    'Seeded roles:',
    roles.map((role) => role.name),
  );

  // seed random user data (employee)
  for (let i = 0; i < 5; i++) {
    const email = faker.internet.email();
    const randomPosition =
      positions[Math.floor(Math.random() * positions.length)];
    const user = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        username: faker.internet.username(),
        email: email,
        password: await bcrypt.hash('password123', 10),
        positionId: randomPosition.id,
        roleId: roles.find((r) => r.name === 'Employee')!.id,
        phoneNumber: faker.phone.number(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
      },
    });

    console.log(
      `Seeded user (${user.id}): ${user.username} with email ${user.email}`,
    );
  }

  // seed a specific HR user
  const hrEmail = 'hr@admin.com';
  const hrUser = await prisma.user.upsert({
    where: { email: hrEmail },
    update: {},
    create: {
      username: 'hradmin',
      email: hrEmail,
      password: await bcrypt.hash('superadmin', 10),
      positionId: positions.find((p) => p.name === 'HR Manager')!.id,
      roleId: roles.find((r) => r.name === 'HR')!.id,
      phoneNumber: faker.phone.number(),
      firstName: 'HR',
      lastName: 'Admin',
    },
  });

  console.log(
    `Seeded HR user (${hrUser.id}): ${hrUser.username} with email ${hrUser.email}`,
  );

  // assign work schedule to users
  const allUsers = await prisma.user.findMany();
  const allWorkSchedule = await prisma.workSchedule.findMany();

  for (const user of allUsers) {
    const randomWorkSchedule =
      allWorkSchedule[Math.floor(Math.random() * allWorkSchedule.length)];

    const userWithSchedule = await prisma.userWorkSchedule.create({
      data: {
        userId: user.id,
        workScheduleId: randomWorkSchedule.id,
      },
    });

    console.log(
      `Assigned work schedule '${randomWorkSchedule.name}' to user ${user.username} with id ${userWithSchedule.id}`,
    );
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
