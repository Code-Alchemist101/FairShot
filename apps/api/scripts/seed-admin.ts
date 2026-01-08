import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function createAdminUser() {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@fairshot.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

    console.log('🔧 Creating admin user...');

    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { email: adminEmail },
    });

    if (existingAdmin) {
        console.log('✅ Admin user already exists:', adminEmail);

        // Update role to ADMIN if not already
        if (existingAdmin.role !== UserRole.ADMIN) {
            await prisma.user.update({
                where: { id: existingAdmin.id },
                data: { role: UserRole.ADMIN },
            });
            console.log('✅ Updated existing user to ADMIN role');
        }

        return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Create admin user
    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            passwordHash: hashedPassword,
            role: UserRole.ADMIN,
        },
    });

    console.log('✅ Admin user created successfully!');
    console.log('📧 Email:', adminEmail);
    console.log('🔑 Password:', adminPassword);
    console.log('⚠️  Please change the password after first login!');
    console.log('');
    console.log('🔐 Login at: http://localhost:3000/login');
}

createAdminUser()
    .catch((error) => {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
