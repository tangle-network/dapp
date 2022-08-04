async function main() {
  setTimeout(() => {
    throw new Error('error');
  }, 3000);
  for (let i = 0; i < 10; i++) {
    console.log(`Iteration ${i}`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

main().catch(console.error);
