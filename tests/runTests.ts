import { AuthService } from '../server/services/auth.service';
import { ListingService } from '../server/services/listing.service';
import { ClaimService } from '../server/services/claim.service';
import { VolunteerService } from '../server/services/volunteer.service';
import { AdminService } from '../server/services/admin.service';
import { AuditService } from '../server/services/audit.service';
import { seedDatabase } from '../server/db/seed';
import { db } from '../server/db/jsonDb';

interface TestResult {
  title: string;
  category: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function assert(condition: boolean, title: string, category: string, failureMsg?: string) {
  if (condition) {
    results.push({ title, category, passed: true });
    console.log(`  ✓ [PASS] ${title}`);
  } else {
    results.push({ title, category, passed: false, error: failureMsg || 'Assertion failed' });
    console.error(`  ✗ [FAIL] ${title}: ${failureMsg || 'Assertion failed'}`);
  }
}

async function runTestSuite() {
  console.log('==================================================');
  console.log('🧪 Starting FoodLink Automated Functional Test Suite');
  console.log('==================================================\n');

  // Reset database to initial seed state
  await seedDatabase();

  // 1. AUTHENTICATION TESTS
  console.log('--- 1. Authentication Tests ---');
  try {
    const adminLogin = await AuthService.login('admin@foodlink.org', 'FoodLink@2026');
    assert(adminLogin.user.role === 'ADMIN', 'Admin Login with valid credentials', 'Authentication');
  } catch (e: any) {
    assert(false, 'Admin Login with valid credentials', 'Authentication', e.message);
  }

  try {
    const donorLogin = await AuthService.login('donor.spice@foodlink.org', 'FoodLink@2026');
    assert(donorLogin.user.role === 'DONOR', 'Donor Login with valid credentials', 'Authentication');
  } catch (e: any) {
    assert(false, 'Donor Login with valid credentials', 'Authentication', e.message);
  }

  try {
    await AuthService.login('admin@foodlink.org', 'WrongPassword123');
    assert(false, 'Invalid password rejection', 'Authentication', 'Should have thrown 401');
  } catch (e: any) {
    assert(e.statusCode === 401, 'Invalid password rejection', 'Authentication');
  }

  try {
    const regDonor = await AuthService.register({
      name: 'New Test Donor',
      email: 'newdonor@test.org',
      password: 'Password123!',
      role: 'DONOR',
      phone: '+91 99999 11111',
      city: 'Hyderabad',
    });
    assert(regDonor.user.role === 'DONOR', 'Register user with DONOR role', 'Registration');
  } catch (e: any) {
    assert(false, 'Register user with DONOR role', 'Registration', e.message);
  }

  try {
    const regRec = await AuthService.register({
      name: 'New Test Receiver',
      email: 'newreceiver@test.org',
      password: 'Password123!',
      role: 'RECEIVER',
      phone: '+91 99999 22222',
      organization: 'Care Shelter',
      city: 'Bengaluru',
    });
    assert(regRec.user.role === 'RECEIVER', 'Register user with RECEIVER role', 'Registration');
  } catch (e: any) {
    assert(false, 'Register user with RECEIVER role', 'Registration', e.message);
  }

  // 2. DONOR & LISTINGS VALIDATION TESTS
  console.log('\n--- 2. Donor Listing Creation & Validation Tests ---');
  const donorUser = AuthService.getUserById('usr_donor_001');

  try {
    const validListing = ListingService.createListing(
      {
        title: 'Test Banquet Meal Box',
        description: 'Nutritious dinner meals.',
        category: 'COOKED_MEALS',
        quantityServings: 25,
        quantityKgOrItems: '8 kg',
        preparedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        packagingType: 'BOXED',
        storageTemp: 'HOT',
        dietaryTags: ['VEGETARIAN'],
        hygieneChecked: true,
        pickupAddress: 'Road 10, Jubliee Hills',
        landmark: 'Near Checkpost',
        city: 'Hyderabad',
      },
      donorUser
    );
    assert(validListing.status === 'ACTIVE', 'Create valid food listing', 'Donor Flow');
  } catch (e: any) {
    assert(false, 'Create valid food listing', 'Donor Flow', e.message);
  }

  try {
    ListingService.createListing(
      {
        title: 'Invalid Date Meal',
        description: 'Test invalid expiry',
        category: 'COOKED_MEALS',
        quantityServings: 10,
        quantityKgOrItems: '2 kg',
        preparedAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 1 * 3600 * 1000).toISOString(), // Expiry before prep!
        packagingType: 'BOXED',
        storageTemp: 'HOT',
        dietaryTags: [],
        hygieneChecked: true,
        pickupAddress: 'Road 10',
        landmark: '',
        city: 'Hyderabad',
      },
      donorUser
    );
    assert(false, 'Reject expiry date before preparation date', 'Validation', 'Should have failed');
  } catch (e: any) {
    assert(e.statusCode === 400, 'Reject expiry date before preparation date', 'Validation');
  }

  try {
    ListingService.createListing(
      {
        title: 'Uncertified Food',
        description: 'No hygiene check',
        category: 'COOKED_MEALS',
        quantityServings: 10,
        quantityKgOrItems: '2 kg',
        preparedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
        expiresAt: new Date(Date.now() + 6 * 3600 * 1000).toISOString(),
        packagingType: 'BOXED',
        storageTemp: 'HOT',
        dietaryTags: [],
        hygieneChecked: false, // Mandatory hygiene declaration missing!
        pickupAddress: 'Road 10',
        landmark: '',
        city: 'Hyderabad',
      },
      donorUser
    );
    assert(false, 'Reject listing without mandatory hygiene declaration', 'Validation', 'Should have failed');
  } catch (e: any) {
    assert(e.statusCode === 400, 'Reject listing without mandatory hygiene declaration', 'Validation');
  }

  // 3. RECEIVER CLAIM & ISOLATION TESTS
  console.log('\n--- 3. Receiver Claim & Data Isolation Tests ---');
  const receiverUser1 = AuthService.getUserById('usr_receiver_001');
  const receiverUser2 = AuthService.getUserById('usr_receiver_002');

  try {
    const claimRes = ClaimService.claimFood(
      {
        listingId: 'lst_001',
        estimatedPickupTime: 'In 30 mins',
        claimNotes: 'For orphanage dinner',
      },
      receiverUser1
    );
    assert(claimRes.listing.status === 'CLAIMED', 'Receiver claim active food item', 'Receiver Flow');
    assert(!!claimRes.listing.claimCode, 'Generate unique verification claim code', 'Receiver Flow');
    assert(claimRes.task.status === 'AVAILABLE', 'Automatically create volunteer task upon claim', 'Receiver Flow');
  } catch (e: any) {
    assert(false, 'Receiver claim active food item', 'Receiver Flow', e.message);
  }

  // Receiver Data Isolation test
  const receiver1Claims = ClaimService.getReceiverClaims(receiverUser1.id);
  const receiver2Claims = ClaimService.getReceiverClaims(receiverUser2.id);

  assert(
    receiver1Claims.every((c) => c.claimedByReceiverId === receiverUser1.id),
    'Receiver 1 sees strictly own claims',
    'Security Isolation'
  );

  assert(
    receiver2Claims.every((c) => c.claimedByReceiverId === receiverUser2.id),
    'Receiver 2 sees strictly own claims',
    'Security Isolation'
  );

  // 4. VOLUNTEER LIFECYCLE TESTS
  console.log('\n--- 4. Volunteer Delivery Task Lifecycle Tests ---');
  const volunteerUser = AuthService.getUserById('usr_volunteer_001');

  let task = VolunteerService.getTasks({ availableOnly: true })[0];
  assert(!!task, 'Query available volunteer tasks', 'Volunteer Flow');

  if (task) {
    try {
      task = VolunteerService.acceptTask(task.id, volunteerUser);
      assert(task.status === 'ACCEPTED', 'Volunteer accept task', 'Volunteer Flow');

      task = VolunteerService.updateTaskStatus(task.id, 'PICKUP_IN_PROGRESS', volunteerUser);
      assert(task.status === 'PICKUP_IN_PROGRESS', 'Transition ACCEPTED -> PICKUP_IN_PROGRESS', 'Volunteer Flow');

      task = VolunteerService.updateTaskStatus(task.id, 'PICKED_UP', volunteerUser);
      assert(task.status === 'PICKED_UP', 'Transition PICKUP_IN_PROGRESS -> PICKED_UP', 'Volunteer Flow');

      task = VolunteerService.updateTaskStatus(task.id, 'DELIVERY_IN_PROGRESS', volunteerUser);
      assert(task.status === 'DELIVERY_IN_PROGRESS', 'Transition PICKED_UP -> DELIVERY_IN_PROGRESS', 'Volunteer Flow');

      // Complete with claim code
      task = VolunteerService.updateTaskStatus(task.id, 'COMPLETED', volunteerUser, task.claimCode);
      assert(task.status === 'COMPLETED', 'Transition DELIVERY_IN_PROGRESS -> COMPLETED with claim code', 'Volunteer Flow');

      const completedListing = ListingService.getListingById(task.listingId);
      assert(completedListing.status === 'COMPLETED', 'Associated listing updated to COMPLETED', 'Volunteer Flow');
    } catch (e: any) {
      assert(false, 'Volunteer task lifecycle transition', 'Volunteer Flow', e.message);
    }
  }

  // 5. ADMIN CONTROL & SUSPENSION TESTS
  console.log('\n--- 5. Admin Controls & Suspension Tests ---');
  const adminUser = AuthService.getUserById('usr_admin_001');

  try {
    const stats = AdminService.getStats();
    assert(stats.totalUsers > 0, 'Admin calculate platform statistics', 'Admin Flow');
  } catch (e: any) {
    assert(false, 'Admin calculate platform statistics', 'Admin Flow', e.message);
  }

  try {
    const suspendedDonor = AdminService.toggleSuspendUser('usr_donor_002', adminUser);
    assert(suspendedDonor.status === 'SUSPENDED', 'Admin suspend user account', 'Admin Flow');

    // Attempt login as suspended user
    await AuthService.login('donor.green@foodlink.org', 'FoodLink@2026');
    assert(false, 'Prevent suspended user from logging in', 'Security', 'Should have failed');
  } catch (e: any) {
    assert(e.statusCode === 403, 'Prevent suspended user from logging in', 'Security');
  }

  // 6. AUDIT LOGS TEST
  console.log('\n--- 6. Audit Trail Logging Tests ---');
  const logs = AuditService.getLogs();
  assert(logs.length > 0, 'Audit logs recorded for platform actions', 'Audit');

  console.log('\n==================================================');
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = results.filter((r) => !r.passed).length;
  console.log(`TEST SUMMARY: Total: ${results.length} | Passed: ${passedCount} | Failed: ${failedCount}`);
  console.log('==================================================\n');

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Test suite runner crashed:', err);
  process.exit(1);
});
