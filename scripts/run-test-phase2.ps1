
$env:d = "c:\Users\user\.gemini\antigravity\scratch\smart_avenue real"
cd $env:d
npx tsx scripts/test-phase2.ts > test-output.txt 2>&1
