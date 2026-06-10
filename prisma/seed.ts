import { PrismaClient } from '@prisma/client'
import bcryptjs from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Seed Species
  const camel = await prisma.species.create({ data: { nameEn: 'Camel', nameAr: 'جمل', icon: '🐫' } })
  const falcon = await prisma.species.create({ data: { nameEn: 'Falcon', nameAr: 'صقر', icon: '🦅' } })
  const dog = await prisma.species.create({ data: { nameEn: 'Dog', nameAr: 'كلب', icon: '🐕' } })
  const cat = await prisma.species.create({ data: { nameEn: 'Cat', nameAr: 'قطة', icon: '🐈' } })
  const horse = await prisma.species.create({ data: { nameEn: 'Horse', nameAr: 'حصان', icon: '🐎' } })

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

  // Seed Test Catalog
  const tests = await Promise.all([
    // Hematology - General (no species)
    prisma.testCatalog.create({ data: { testCode: 'CBC', testNameEn: 'Complete Blood Count', testNameAr: 'تعداد دم كامل', category: 'Hematology', categoryAr: 'أمراض الدم', minNormal: null, maxNormal: null, unit: null, price: 80, turnaround: '2-4 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'HGB', testNameEn: 'Hemoglobin', testNameAr: 'هيموغلوبين', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: dog.id, minNormal: 12, maxNormal: 18, unit: 'g/dL', price: 35, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'HGB-CAT', testNameEn: 'Hemoglobin (Feline)', testNameAr: 'هيموغلوبين (قطط)', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: cat.id, minNormal: 9.5, maxNormal: 15.5, unit: 'g/dL', price: 35, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'WBC', testNameEn: 'White Blood Cell Count', testNameAr: 'عدد كريات الدم البيضاء', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: dog.id, minNormal: 6, maxNormal: 17, unit: '10³/µL', price: 40, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'WBC-CAT', testNameEn: 'WBC Count (Feline)', testNameAr: 'عدد كريات بيضاء (قطط)', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: cat.id, minNormal: 5.5, maxNormal: 19.5, unit: '10³/µL', price: 40, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'PCV', testNameEn: 'Packed Cell Volume', testNameAr: 'حجم الخلايا المضغوط', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: camel.id, minNormal: 24, maxNormal: 38, unit: '%', price: 30, turnaround: '1 hour' } }),
    prisma.testCatalog.create({ data: { testCode: 'RBC-CAM', testNameEn: 'RBC Count (Camel)', testNameAr: 'عدد كريات حمراء (إبل)', category: 'Hematology', categoryAr: 'أمراض الدم', speciesId: camel.id, minNormal: 5.0, maxNormal: 10.5, unit: '10⁶/µL', price: 45, turnaround: '1-2 hours' } }),

    // Biochemistry
    prisma.testCatalog.create({ data: { testCode: 'BIO-01', testNameEn: 'Liver Panel (ALT, AST, ALP)', testNameAr: 'فحص الكبد (ALT, AST, ALP)', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: null, maxNormal: null, unit: null, price: 150, turnaround: '4-6 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'BIO-02', testNameEn: 'Kidney Panel (BUN, Creatinine)', testNameAr: 'فحص الكلى (يوريا، كرياتينين)', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: null, maxNormal: null, unit: null, price: 120, turnaround: '3-5 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'BUN-DOG', testNameEn: 'BUN (Canine)', testNameAr: 'يوريا دم (كلاب)', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', speciesId: dog.id, minNormal: 7, maxNormal: 27, unit: 'mg/dL', price: 45, turnaround: '2-3 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'BUN-CAT', testNameEn: 'BUN (Feline)', testNameAr: 'يوريا دم (قطط)', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', speciesId: cat.id, minNormal: 16, maxNormal: 36, unit: 'mg/dL', price: 45, turnaround: '2-3 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'CREAT-CAM', testNameEn: 'Creatinine (Camel)', testNameAr: 'كرياتينين (إبل)', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', speciesId: camel.id, minNormal: 1.0, maxNormal: 2.5, unit: 'mg/dL', price: 50, turnaround: '2-3 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'GLU', testNameEn: 'Glucose', testNameAr: 'جلوكوز', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', minNormal: null, maxNormal: null, unit: 'mg/dL', price: 35, turnaround: '1-2 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'TP', testNameEn: 'Total Protein', testNameAr: 'بروتين كلي', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', speciesId: dog.id, minNormal: 5.5, maxNormal: 7.5, unit: 'g/dL', price: 40, turnaround: '1-2 hours' } }),

    // Falcon-specific
    prisma.testCatalog.create({ data: { testCode: 'FAL-01', testNameEn: 'Falcon Health Profile', testNameAr: 'فحص صحة الصقور الشامل', category: 'Avian', categoryAr: 'طيور', speciesId: falcon.id, minNormal: null, maxNormal: null, unit: null, price: 250, turnaround: '6-8 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'FAL-02', testNameEn: 'Falcon Hemoparasites', testNameAr: 'طفيليات الدم (صقور)', category: 'Parasitology', categoryAr: 'طفيليات', speciesId: falcon.id, minNormal: null, maxNormal: null, unit: null, price: 180, turnaround: '4-6 hours' } }),

    // Horse-specific
    prisma.testCatalog.create({ data: { testCode: 'HOR-01', testNameEn: 'Equine Pre-Purchase Exam', testNameAr: 'فحص ما قبل الشراء (خيول)', category: 'Biochemistry', categoryAr: 'الكيمياء الحيوية', speciesId: horse.id, minNormal: null, maxNormal: null, unit: null, price: 350, turnaround: '8-12 hours' } }),

    // Microbiology
    prisma.testCatalog.create({ data: { testCode: 'MIC-01', testNameEn: 'Bacterial Culture & Sensitivity', testNameAr: 'زراعة بكتيرية وحساسية', category: 'Microbiology', categoryAr: 'الأحياء الدقيقة', minNormal: null, maxNormal: null, unit: null, price: 200, turnaround: '24-48 hours' } }),
    prisma.testCatalog.create({ data: { testCode: 'MIC-02', testNameEn: 'Fungal Culture', testNameAr: 'زراعة فطرية', category: 'Microbiology', categoryAr: 'الأحياء الدقيقة', minNormal: null, maxNormal: null, unit: null, price: 180, turnaround: '48-72 hours' } }),

    // Parasitology
    prisma.testCatalog.create({ data: { testCode: 'PAR-01', testNameEn: 'Fecal Examination', testNameAr: 'فحص براز', category: 'Parasitology', categoryAr: 'طفيليات', minNormal: null, maxNormal: null, unit: null, price: 60, turnaround: '2-4 hours' } }),

    // Hormones
    prisma.testCatalog.create({ data: { testCode: 'HORM-01', testNameEn: 'Thyroid Panel (T4, T3)', testNameAr: 'فحص الغدة الدرقية (T4, T3)', category: 'Endocrinology', categoryAr: 'الغدد الصماء', speciesId: dog.id, minNormal: 1.0, maxNormal: 4.0, unit: 'µg/dL', price: 160, turnaround: '6-8 hours' } }),
  ])

  // Seed Invoices
  const invoice1 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-001',
      clinicId: clinic1.id,
      subTotal: 680,
      vatRate: 0.15,
      vatAmount: 102,
      totalAmount: 782,
      paidAmount: 782,
      status: 'Paid',
      dueDate: new Date('2025-02-15'),
    }
  })

  const invoice2 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-002',
      clinicId: clinic2.id,
      subTotal: 1150,
      vatRate: 0.15,
      vatAmount: 172.5,
      totalAmount: 1322.5,
      paidAmount: 1322.5,
      status: 'Paid',
      dueDate: new Date('2025-02-20'),
    }
  })

  const invoice3 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-003',
      clinicId: clinic5.id,
      subTotal: 950,
      vatRate: 0.15,
      vatAmount: 142.5,
      totalAmount: 1092.5,
      paidAmount: 500,
      status: 'Partially_Paid',
      dueDate: new Date('2025-03-01'),
    }
  })

  const invoice4 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-004',
      clinicId: clinic3.id,
      subTotal: 420,
      vatRate: 0.15,
      vatAmount: 63,
      totalAmount: 483,
      paidAmount: 0,
      status: 'Unpaid',
      dueDate: new Date('2025-03-10'),
    }
  })

  const invoice5 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-005',
      clinicId: clinic4.id,
      subTotal: 560,
      vatRate: 0.15,
      vatAmount: 84,
      totalAmount: 644,
      paidAmount: 300,
      status: 'Partially_Paid',
      dueDate: new Date('2025-03-15'),
    }
  })

  const invoice6 = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-006',
      clinicId: clinic1.id,
      subTotal: 380,
      vatRate: 0.15,
      vatAmount: 57,
      totalAmount: 437,
      paidAmount: 437,
      status: 'Paid',
      dueDate: new Date('2025-03-20'),
    }
  })

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
        testIds: [tests[0].id, tests[1].id, tests[13].id].join(','),
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
        testIds: [tests[14].id, tests[15].id].join(','),
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
        testIds: [tests[5].id, tests[6].id, tests[12].id].join(','),
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
        testIds: [tests[16].id].join(','),
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
        testIds: [tests[5].id, tests[19].id].join(','),
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
        testIds: [tests[0].id, tests[9].id, tests[20].id].join(','),
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
        testIds: [tests[14].id].join(','),
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
    prisma.sampleResult.create({ data: { sampleId: samples[0].id, catalogId: tests[13].id, resultValue: '95', isPanic: false } }),

    // Sample 5 - Approved results for cat (Luna) - with panic
    prisma.sampleResult.create({ data: { sampleId: samples[4].id, catalogId: tests[2].id, resultValue: '7.1', isPanic: true, notes: 'Below normal range (9.5-15.5)' } }),
    prisma.sampleResult.create({ data: { sampleId: samples[4].id, catalogId: tests[4].id, resultValue: '22.3', isPanic: true, notes: 'Above normal range (5.5-19.5)' } }),
    prisma.sampleResult.create({ data: { sampleId: samples[4].id, catalogId: tests[10].id, resultValue: '42', isPanic: true, notes: 'Above normal range (16-36)' } }),

    // Sample 8 - Completed for dog (Rocky)
    prisma.sampleResult.create({ data: { sampleId: samples[7].id, catalogId: tests[0].id, resultValue: 'Normal', isPanic: false } }),
    prisma.sampleResult.create({ data: { sampleId: samples[7].id, catalogId: tests[9].id, resultValue: '15.2', isPanic: false } }),
    prisma.sampleResult.create({ data: { sampleId: samples[7].id, catalogId: tests[20].id, resultValue: 'Negative', isPanic: false } }),

    // Sample 10 - Completed for cat (Milo)
    prisma.sampleResult.create({ data: { sampleId: samples[9].id, catalogId: tests[2].id, resultValue: '12.8', isPanic: false } }),
    prisma.sampleResult.create({ data: { sampleId: samples[9].id, catalogId: tests[4].id, resultValue: '10.5', isPanic: false } }),
  ])

  // Seed Users
  const hashedPassword = await bcryptjs.hash('admin123', 10)
  
  await prisma.user.createMany({
    data: [
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
    ],
    skipDuplicates: true,
  })

  console.log('✅ Seed data inserted successfully!')
  console.log(`  Species: 5`)
  console.log(`  Clinics: 5`)
  console.log(`  Pets: 10`)
  console.log(`  Tests: ${tests.length}`)
  console.log(`  Invoices: 6`)
  console.log(`  Samples: ${samples.length}`)
  console.log(`  Results: 10`)
  console.log(`  Users: 3 (admin, doctor, technician)`)
  console.log('\n🔑 Default Credentials:')
  console.log('  Email: admin@lab.sa | doctor1@lab.sa | tech1@lab.sa')
  console.log('  Password: admin123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
