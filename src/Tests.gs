/**
 * ReservABot - Automated Test Suite
 * 
 * Run runAllTests() in the Apps Script editor to verify core business logic,
 * string comparisons, and template engines without sending live emails.
 */

function runAllTests() {
  const results = [];
  
  function assert(testName, condition, detail) {
    if (condition) {
      results.push({ test: testName, status: "PASSED" });
      Logger.log("PASSED: " + testName);
    } else {
      results.push({ test: testName, status: "FAILED", error: detail });
      Logger.log("FAILED: " + testName + " - " + detail);
    }
  }

  Logger.log("=== Starting ReservABot Test Suite ===");

  // Test 1: Config Value Fallback
  try {
    const val = getConfigValue("NON_EXISTENT_PARAM_KEY_12345", "fallback_val");
    assert("getConfigValue Fallback", val === "fallback_val", "Expected fallback_val, got " + val);
  } catch (e) {
    assert("getConfigValue Fallback", false, e.message);
  }

  // Test 2: Template Parser String Substitution & Aliasing
  try {
    const mockVars = {
      UserName: "Test Skipper",
      BoatID: "B1",
      StartDateTime: "2026-11-01 09:00",
      EndDateTime: "2026-11-01 12:00",
      ReservationUUID: "test-uuid-001"
    };
    
    // Test with ApprovalRequest template
    const parsed = getFormattedTemplate("ApprovalRequest", mockVars);
    const hasName = parsed.body.includes("Test Skipper");
    const hasBoat = parsed.body.includes("B1");
    const hasNoUnresolvedName = !parsed.body.includes("{{UserName}}");
    
    assert("getFormattedTemplate Variable Resolution", hasName && hasBoat && hasNoUnresolvedName, "Template placeholders failed to resolve.");
  } catch (e) {
    assert("getFormattedTemplate Variable Resolution", false, e.message);
  }

  // Test 3: Legacy Token Alias Support (RequesterName)
  try {
    const legacyVars = {
      RequesterName: "Legacy User",
      BoatID: "B2"
    };
    const parsedLegacy = getFormattedTemplate("ApprovalRequest", legacyVars);
    assert("getFormattedTemplate Legacy Alias Support", parsedLegacy.body.includes("Legacy User"), "RequesterName failed to alias to UserName.");
  } catch (e) {
    assert("getFormattedTemplate Legacy Alias Support", false, e.message);
  }

  // Test 4: Operator Lookup Trim & Case-Insensitivity
  try {
    const opsLower = getOperatorsForBoat("b1");
    const opsPadded = getOperatorsForBoat("  B1  ");
    assert("getOperatorsForBoat String Normalization", Array.isArray(opsLower) && opsLower.length === opsPadded.length, "Case/whitespace mismatch in boat lookup.");
  } catch (e) {
    assert("getOperatorsForBoat String Normalization", false, e.message);
  }

  // Test 5: Execution Logger Safety
  try {
    logOperationalEvent("INFO", "[TEST_SUITE] Diagnostic runAllTests verification event.");
    assert("logOperationalEvent Invocation", true, "");
  } catch (e) {
    assert("logOperationalEvent Invocation", false, e.message);
  }

  Logger.log("=== Test Suite Summary ===");
  const passedCount = results.filter(r => r.status === "PASSED").length;
  Logger.log("Results: " + passedCount + " / " + results.length + " tests passed.");
}
