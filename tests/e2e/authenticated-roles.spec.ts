import {expect,test} from "@playwright/test";

const accounts=[
  ["listener","E2E_LISTENER_EMAIL","E2E_LISTENER_PASSWORD","/listener"],
  ["artist","E2E_ARTIST_EMAIL","E2E_ARTIST_PASSWORD","/artist"],
  ["dj","E2E_DJ_EMAIL","E2E_DJ_PASSWORD","/dj"],
  ["matatu","E2E_MATATU_EMAIL","E2E_MATATU_PASSWORD","/matatu"],
  ["admin","E2E_ADMIN_EMAIL","E2E_ADMIN_PASSWORD","/admin"],
] as const;

for(const [role,emailKey,passwordKey,home] of accounts){
  test(`${role} can sign in and reach the correct protected home`,async({page})=>{
    const email=process.env[emailKey],password=process.env[passwordKey];
    test.skip(!email||!password,`Set ${emailKey} and ${passwordKey} to certify this role.`);
    await page.goto(`/login?next=${encodeURIComponent(home)}`);
    await page.getByLabel("Email").fill(email!);
    await page.getByRole("textbox",{name:"Password"}).fill(password!);
    await page.getByRole("button",{name:"Sign in"}).click();
    await expect(page).toHaveURL(new RegExp(`${home.replace("/","\\/")}(?:$|\\?)`),{timeout:15_000});
    await expect(page.getByRole("main")).toBeVisible();
  });
}
