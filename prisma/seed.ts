import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed Species
  const camel = await prisma.species.create({ data: { nameEn: 'Camel', nameAr: 'جمل', icon: '🐫' } })
  const sheep = await prisma.species.create({ data: { nameEn: 'Sheep', nameAr: 'خروف', icon: '🐑' } })
  const goat = await prisma.species.create({ data: { nameEn: 'Goat', nameAr: 'ماعز', icon: '🐐' } })
  const cat = await prisma.species.create({ data: { nameEn: 'Cat', nameAr: 'قطة', icon: '🐈' } })
  const horse = await prisma.species.create({ data: { nameEn: 'Horse', nameAr: 'حصان', icon: '🐎' } })
  // Remapped from removed species so existing pet/test references still resolve
  const falcon = sheep
  const dog = goat

  // Seed Animals for Quick Reports
  const camelAnimal = await prisma.animal.create({ data: { nameEn: 'Camel', nameAr: 'إبل', icon: '🐫' } })
  const sheepAnimal = await prisma.animal.create({ data: { nameEn: 'Sheep', nameAr: 'غنم', icon: '🐑' } })
  const goatAnimal = await prisma.animal.create({ data: { nameEn: 'Goat', nameAr: 'ماعز', icon: '🐐' } })
  const catAnimal = await prisma.animal.create({ data: { nameEn: 'Cat', nameAr: 'قطة', icon: '🐈' } })
  const horseAnimal = await prisma.animal.create({ data: { nameEn: 'Horse', nameAr: 'خيل', icon: '🐎' } })


  // Seed Clinics
  const clinic1 = await prisma.clinic.create({
    data: {
      clinicName: 'Al Riyadah Veterinary Clinic',
      clinicNameAr: 'عيادة الرياضة البيطرية',
      taxNumber: '300000000000003',
      commercialRegister: '1010123456',
      contactName: 'Dr. Ahmed Al-Farsi',
      contactNameAr: 'د. أحمد الفارسي',
      phone: '+966501234567',
      email: 'info@riyadah-vet.sa',
      address: 'King Fahd Road, Riyadh',
      addressAr: 'طريق الملك فهد، الرياض',
      city: 'Riyadh',
      cityAr: 'الرياض',
    }
  })

  const clinic2 = await prisma.clinic.create({
    data: {
      clinicName: 'Desert Falcon Center',
      clinicNameAr: 'مركز صقور الصحراء',
      taxNumber: '300000000000004',
      commercialRegister: '1010654321',
      contactName: 'Dr. Khalid Al-Salem',
      contactNameAr: 'د. خالد السالم',
      phone: '+966507654321',
      email: 'contact@desert-falcon.sa',
      address: 'Olaya Street, Riyadh',
      addressAr: 'شارع العليا، الرياض',
      city: 'Riyadh',
      cityAr: 'الرياض',
    }
  })

  const clinic3 = await prisma.clinic.create({
    data: {
      clinicName: 'Eastern Stables Veterinary',
      clinicNameAr: 'إسطبلات الشرق البيطرية',
      taxNumber: '300000000000005',
      commercialRegister: '1010987654',
      contactName: 'Dr. Fatima Al-Harbi',
      contactNameAr: 'د. فاطمة الحربي',
      phone: '+966509876543',
      email: 'info@eastern-stables.sa',
      address: 'Dammam Road, Al Khobar',
      addressAr: 'طريق الدمام، الخبر',
      city: 'Al Khobar',
      cityAr: 'الخبر',
    }
  })

  const clinic4 = await prisma.clinic.create({
    data: {
      clinicName: 'Jeddah Pet Care',
      clinicNameAr: 'رعاية الحيوانات الأليفة بجدة',
      taxNumber: '300000000000006',
      commercialRegister: '1010111222',
      contactName: 'Dr. Sara Al-Mohammadi',
      contactNameAr: 'د. سارة المحمدي',
      phone: '+966501112233',
      email: 'care@jeddah-pet.sa',
      address: 'Tahlia Street, Jeddah',
      addressAr: 'شارع تحلية، جدة',
      city: 'Jeddah',
      cityAr: 'جدة',
    }
  })

  const clinic5 = await prisma.clinic.create({
    data: {
      clinicName: 'Najdi Camel Hospital',
      clinicNameAr: 'مستشفى نجد للإبل',
      taxNumber: '300000000000007',
      commercialRegister: '1010333444',
      contactName: 'Dr. Mohammed Al-Dosari',
      contactNameAr: 'د. محمد الدوسري',
      phone: '+966503334444',
      email: 'info@najdi-camel.sa',
      address: 'King Abdulaziz Road, Buraidah',
      addressAr: 'طريق الملك عبدالعزيز، بريدة',
      city: 'Buraidah',
      cityAr: 'بريدة',
    }
  })

  // Seed Pets
  const pets = await Promise.all([
    prisma.pet.create({ data: { name: 'Mishmish', nameAr: 'مشمش', speciesId: cat.id, breed: 'Persian', breedAr: 'فارسي', gender: 'Male', ownerName: 'Abdullah Al-Rashid', ownerPhone: '+966505551111', clinicId: clinic1.id } }),
    prisma.pet.create({ data: { name: 'Sultan', nameAr: 'سلطان', speciesId: falcon.id, breed: 'Peregrine', breedAr: 'شاهين', gender: 'Male', ownerName: 'Nasser Al-Otaibi', ownerPhone: '+966505552222', clinicId: clinic2.id } }),
    prisma.pet.create({ data: { name: 'Ramlah', nameAr: 'رملة', speciesId: camel.id, breed: 'Magahi', breedAr: 'مغاتي', gender: 'Female', ownerName: 'Turki Al-Qahtani', ownerPhone: '+966505553333', clinicId: clinic5.id } }),
    prisma.pet.create({ data: { name: 'Buddy', nameAr: 'بادي', speciesId: dog.id, breed: 'Golden Retriever', breedAr: 'جولدن ريتريفر', gender: 'Male', ownerName: 'Layla Al-Shehri', ownerPhone: '+966505554444', clinicId: clinic4.id } }),
    prisma.pet.create({ data: { name: 'Luna', nameAr: 'لونا', speciesId: cat.id, breed: 'Siamese', breedAr: 'سيامي', gender: 'Female', ownerName: 'Hassan Al-Zahrani', ownerPhone: '+966505555555', clinicId: clinic1.id } }),
    prisma.pet.create({ data: { name: 'Sharif', nameAr: 'شريف', speciesId: horse.id, breed: 'Arabian', breedAr: 'عربي أصيل', gender: 'Male', ownerName: 'Faisal Al-Sharif', ownerPhone: '+966505556666', clinicId: clinic3.id } }),
    prisma.pet.create({ data: { name: 'Zahra', nameAr: 'زهرة', speciesId: camel.id, breed: 'Sudani', breedAr: 'سوداني', gender: 'Female', ownerName: 'Omar Al-Ghamdi', ownerPhone: '+966505557777', clinicId: clinic5.id } }),
    prisma.pet.create({ data: { name: 'Rocky', nameAr: 'روكي', speciesId: dog.id, breed: 'German Shepherd', breedAr: 'راعي ألماني', gender: 'Male', ownerName: 'Noura Al-Mutairi', ownerPhone: '+966505558888', clinicId: clinic4.id } }),
    prisma.pet.create({ data: { name: 'Falcon-7', nameAr: 'صقر-7', speciesId: falcon.id, breed: 'Saker', breedAr: 'حر', gender: 'Female', ownerName: 'Majed Al-Hajri', ownerPhone: '+966505559999', clinicId: clinic2.id } }),
    prisma.pet.create({ data: { name: 'Milo', nameAr: 'ميلو', speciesId: cat.id, breed: 'British Shorthair', breedAr: 'بريتش شورتهير', gender: 'Male', ownerName: 'Reem Al-Ansari', ownerPhone: '+966505550000', clinicId: clinic1.id } }),
  ])

  // Seed Test Catalog — Accurate veterinary reference ranges from published literature
  const tests = await Promise.all([
    // ── Hematology — General (no species) ────────────────────────────────────
    prisma.testCatalog.create({ data: { testCode: 'CBC', testNameEn: 'Complete Blood Count', testNameAr: 'تعداد دم كامل', category: 'Hematology', categoryAr: 'أمراض الدم', minNormal: null, maxNormal: null, minNormalOld: null, maxNormalOld: null, unit: null, price: 80, turnaround: '2-4 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'HGB', testNameEn: 'Hemoglobin', testNameAr: 'هيموغلوبين', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: dog.id, minNormal: 12, maxNormal: 18, minNormalOld: 11, maxNormalOld: 17, unit: 'g/dL', price: 35, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'HGB-CAT', testNameEn: 'Hemoglobin (Feline)', testNameAr: 'هيموغلوبين (قطط)', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: cat.id, animalIds: catAnimal.id, minNormal: 9.8, maxNormal: 15.4, minNormalOld: 9.0, maxNormalOld: 14.5, unit: 'g/dL', price: 35, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'WBC', testNameEn: 'White Blood Cell Count', testNameAr: 'عدد كريات الدم البيضاء', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: dog.id, minNormal: 6, maxNormal: 17, minNormalOld: 5.5, maxNormalOld: 15, unit: '10³/µL', price: 40, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'WBC-CAT', testNameEn: 'WBC Count (Feline)', testNameAr: 'عدد كريات بيضاء (قطط)', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: cat.id, animalIds: catAnimal.id, minNormal: 5.5, maxNormal: 19.5, minNormalOld: 5.0, maxNormalOld: 18.0, unit: '10³/µL', price: 40, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'PCV', testNameEn: 'Packed Cell Volume (HCT)', testNameAr: 'حجم الخلايا المكدسة', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: camel.id, animalIds: camelAnimal.id, minNormal: 20, maxNormal: 37, minNormalOld: 24, maxNormalOld: 42, unit: '%', price: 30, turnaround: '1 hour' } }),
    prisma.testCatalog.create({ data: { testCode: 'RBC-CAM', testNameEn: 'RBC Count (Camel)', testNameAr: 'عدد كريات حمراء (إبل)', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: camel.id, animalIds: camelAnimal.id, minNormal: 6.8, maxNormal: 13.6, minNormalOld: 6.0, maxNormalOld: 12.0, unit: '10⁶/µL', price: 45, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'PLT', testNameEn: 'Platelet Count', testNameAr: 'عدد الصفائح الدموية', category: 'Hematology', categoryAr: 'أمراض الدم', minNormal: 175, maxNormal: 500, minNormalOld: 200, maxNormalOld: 500, unit: '10³/µL', price: 30, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'RETIC', testNameEn: 'Reticulocyte Count', testNameAr: 'عدد الخلايا الشبكية', category: 'Hematology', categoryAr: 'أمراض الدم', minNormal: 0, maxNormal: 1.5, minNormalOld: 0, maxNormalOld: 1.0, unit: '%', price: 40, turnaround: '2-4 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'SMEAR', testNameEn: 'Blood Smear Examination', testNameAr: 'فحص لطاخة دم', category: 'Hematology', categoryAr: 'أمراض الدم', minNormal: null, maxNormal: null, minNormalOld: null, maxNormalOld: null, unit: null, price: 50, turnaround: '1-2 hours' } }),

    // ── Biochemistry ─────────────────────────────────────────────────────────
    prisma.testCatalog.create({ data: { testCode: 'ALB', testNameEn: 'Albumin', testNameAr: 'ألبومين', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: 2.3, maxNormal: 4.0, minNormalOld: 2.7, maxNormalOld: 3.8, unit: 'g/dL', price: 35, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'ALT', testNameEn: 'ALT/GPT', testNameAr: 'ALT/GPT', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: 10, maxNormal: 100, minNormalOld: 12, maxNormalOld: 90, unit: 'U/L', price: 40, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'AST', testNameEn: 'AST/GOT', testNameAr: 'AST/GOT', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: 10, maxNormal: 80, minNormalOld: 12, maxNormalOld: 75, unit: 'U/L', price: 40, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'ALP', testNameEn: 'ALP', testNameAr: 'ALP', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: 20, maxNormal: 150, minNormalOld: 25, maxNormalOld: 140, unit: 'U/L', price: 40, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'CA', testNameEn: 'Calcium', testNameAr: 'كالسيوم', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: 8.0, maxNormal: 12.0, minNormalOld: 8.5, maxNormalOld: 11.5, unit: 'mg/dL', price: 35, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'CK', testNameEn: 'CK', testNameAr: 'CK', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: 50, maxNormal: 350, minNormalOld: 60, maxNormalOld: 320, unit: 'U/L', price: 40, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'CREAT', testNameEn: 'Creatinine', testNameAr: 'كرياتينين', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: 0.5, maxNormal: 1.8, minNormalOld: 0.6, maxNormalOld: 1.7, unit: 'mg/dL', price: 40, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'IRON', testNameEn: 'Iron', testNameAr: 'حديد', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: 70, maxNormal: 200, minNormalOld: 80, maxNormalOld: 190, unit: 'µg/dL', price: 50, turnaround: '1-2 hours' } }),
  ])

  // Seed Default Bundles
  const bundles = await Promise.all([
    prisma.bundle.create({ data: { nameEn: 'Hematology Profile', nameAr: 'باقة أمراض الدم', testCodes: 'CBC,HGB,WBC,PCV,PLT', animalIds: '' } }),
    prisma.bundle.create({ data: { nameEn: 'Biochemistry Profile', nameAr: 'باقة الكيمياء الحيوية', testCodes: 'ALB,ALT,AST,ALP,CA,CK,CREAT,IRON', animalIds: '' } }),
  ])

  // Invoices seeding bypassed (cleared)
  const invoice1 = { id: undefined }
  const invoice2 = { id: undefined }
  const invoice3 = { id: undefined }
  const invoice4 = { id: undefined }
  const invoice5 = { id: undefined }
  const invoice6 = { id: undefined }

  // Seed Lab Samples
  const now = new Date()
  const samples = await Promise.all([
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0001',
        petId: pets[0].id,
        clinicId: clinic1.id,
        invoiceId: invoice1.id,
        referringDoctor: 'Dr. Ahmed Al-Farsi',
        referringDoctorAr: 'د. أحمد الفارسي',
        testIds: [tests[0].id, tests[1].id, tests[10].id].join(','),
        status: 'Completed',
        priority: 'Normal',
        collectedAt: new Date(now.getTime() - 5 * 86400000),
        completedAt: new Date(now.getTime() - 4 * 86400000),
      }
    }),
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0002',
        petId: pets[1].id,
        clinicId: clinic2.id,
        invoiceId: invoice2.id,
        referringDoctor: 'Dr. Khalid Al-Salem',
        referringDoctorAr: 'د. خالد السالم',
        testIds: [tests[11].id, tests[12].id].join(','),
        status: 'In_Progress',
        priority: 'Urgent',
        collectedAt: new Date(now.getTime() - 2 * 86400000),
      }
    }),
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0003',
        petId: pets[2].id,
        clinicId: clinic5.id,
        invoiceId: invoice3.id,
        referringDoctor: 'Dr. Mohammed Al-Dosari',
        referringDoctorAr: 'د. محمد الدوسري',
        testIds: [tests[5].id, tests[6].id, tests[16].id].join(','),
        status: 'In_Progress',
        priority: 'Normal',
        collectedAt: new Date(now.getTime() - 1 * 86400000),
      }
    }),
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0004',
        petId: pets[3].id,
        clinicId: clinic4.id,
        invoiceId: invoice5.id,
        referringDoctor: 'Dr. Sara Al-Mohammadi',
        referringDoctorAr: 'د. سارة المحمدي',
        testIds: [tests[0].id, tests[7].id, tests[8].id].join(','),
        status: 'Collected',
        priority: 'Normal',
        collectedAt: new Date(),
      }
    }),
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0005',
        petId: pets[4].id,
        clinicId: clinic1.id,
        invoiceId: invoice6.id,
        referringDoctor: 'Dr. Ahmed Al-Farsi',
        referringDoctorAr: 'د. أحمد الفارسي',
        testIds: [tests[2].id, tests[4].id, tests[10].id].join(','),
        status: 'Approved',
        priority: 'Normal',
        collectedAt: new Date(now.getTime() - 7 * 86400000),
        completedAt: new Date(now.getTime() - 6 * 86400000),
      }
    }),
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0006',
        petId: pets[5].id,
        clinicId: clinic3.id,
        invoiceId: invoice4.id,
        referringDoctor: 'Dr. Fatima Al-Harbi',
        referringDoctorAr: 'د. فاطمة الحربي',
        testIds: [tests[17].id].join(','),
        status: 'Collected',
        priority: 'STAT',
        collectedAt: new Date(),
        notes: 'Urgent pre-purchase examination',
      }
    }),
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0007',
        petId: pets[6].id,
        clinicId: clinic5.id,
        invoiceId: invoice3.id,
        referringDoctor: 'Dr. Mohammed Al-Dosari',
        referringDoctorAr: 'د. محمد الدوسري',
        testIds: [tests[5].id, tests[14].id].join(','),
        status: 'In_Progress',
        priority: 'Normal',
        collectedAt: new Date(now.getTime() - 1 * 86400000),
      }
    }),
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0008',
        petId: pets[7].id,
        clinicId: clinic4.id,
        invoiceId: invoice5.id,
        referringDoctor: 'Dr. Sara Al-Mohammadi',
        referringDoctorAr: 'د. سارة المحمدي',
        testIds: [tests[0].id, tests[9].id, tests[15].id].join(','),
        status: 'Completed',
        priority: 'Normal',
        collectedAt: new Date(now.getTime() - 3 * 86400000),
        completedAt: new Date(now.getTime() - 2 * 86400000),
      }
    }),
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0009',
        petId: pets[8].id,
        clinicId: clinic2.id,
        invoiceId: invoice2.id,
        referringDoctor: 'Dr. Khalid Al-Salem',
        referringDoctorAr: 'د. خالد السالم',
        testIds: [tests[16].id].join(','),
        status: 'Collected',
        priority: 'Urgent',
        collectedAt: new Date(),
      }
    }),
    prisma.labSample.create({
      data: {
        barcode: 'SMP-2025-0010',
        petId: pets[9].id,
        clinicId: clinic1.id,
        invoiceId: invoice6.id,
        referringDoctor: 'Dr. Ahmed Al-Farsi',
        referringDoctorAr: 'د. أحمد الفارسي',
        testIds: [tests[2].id, tests[4].id].join(','),
        status: 'Completed',
        priority: 'Normal',
        collectedAt: new Date(now.getTime() - 4 * 86400000),
        completedAt: new Date(now.getTime() - 3 * 86400000),
      }
    }),
  ])

  // Seed Sample Results
  await Promise.all([
    // Sample 1 - Completed CBC for cat (Mishmish)
    prisma.sampleResult.create({ data: { sampleId: samples[0].id, catalogId: tests[0].id, resultValue: 'Normal', isPanic: false } }),
    prisma.sampleResult.create({ data: { sampleId: samples[0].id, catalogId: tests[1].id, resultValue: '11.2', isPanic: false } }),
    prisma.sampleResult.create({ data: { sampleId: samples[0].id, catalogId: tests[10].id, resultValue: '3.1', isPanic: false } }),

    // Sample 5 - Approved results for cat (Luna) - with panic
    prisma.sampleResult.create({ data: { sampleId: samples[4].id, catalogId: tests[2].id, resultValue: '7.1', isPanic: true, notes: 'Below normal range (9.5-15.5)' } }),
    prisma.sampleResult.create({ data: { sampleId: samples[4].id, catalogId: tests[4].id, resultValue: '22.3', isPanic: true, notes: 'Above normal range (5.5-19.5)' } }),
    prisma.sampleResult.create({ data: { sampleId: samples[4].id, catalogId: tests[10].id, resultValue: '2.0', isPanic: true, notes: 'Below normal range (2.3-4.0)' } }),

    // Sample 8 - Completed for dog (Rocky)
    prisma.sampleResult.create({ data: { sampleId: samples[7].id, catalogId: tests[0].id, resultValue: 'Normal', isPanic: false } }),
    prisma.sampleResult.create({ data: { sampleId: samples[7].id, catalogId: tests[9].id, resultValue: '15.2', isPanic: false } }),
    prisma.sampleResult.create({ data: { sampleId: samples[7].id, catalogId: tests[15].id, resultValue: '120', isPanic: false } }),

    // Sample 10 - Completed for cat (Milo)
    prisma.sampleResult.create({ data: { sampleId: samples[9].id, catalogId: tests[2].id, resultValue: '12.8', isPanic: false } }),
    prisma.sampleResult.create({ data: { sampleId: samples[9].id, catalogId: tests[4].id, resultValue: '10.5', isPanic: false } }),
  ])

  // Seed Users
  const hashedPassword = await bcryptjs.hash('admin123', 10)
  
    const users = [
    {
      email: 'admin@lab.sa',
      password: hashedPassword,
      fullName: 'Admin User',
      fullNameAr: 'مسؤول النظام',
      role: 'ADMIN',
      active: true,
    },
    {
      email: 'doctor1@lab.sa',
      password: hashedPassword,
      fullName: 'Dr. Fatima Al-Shammari',
      fullNameAr: 'د. فاطمة الشمري',
      role: 'DOCTOR',
      active: true,
    },
    {
      email: 'tech1@lab.sa',
      password: hashedPassword,
      fullName: 'Ahmed Technician',
      fullNameAr: 'فني أحمد',
      role: 'TECHNICIAN',
      active: true,
    },
  ]

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: user,
    })
  }

  console.log('✅ Seed data inserted successfully!')
  console.log(`  Species: 5`)
  console.log(`  Clinics: 5`)
  console.log(`  Pets: 10`)
  console.log(`  Tests: ${tests.length}`)
  console.log(`  Invoices: 6`)
  console.log(`  Samples: ${samples.length}`)
  console.log(`  Results: 10`)
  console.log('\n🔑 Login Credentials (single-operator system):')
  console.log('  Username: drsinf')
  console.log('  Password: 123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })