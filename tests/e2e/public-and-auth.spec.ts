import {expect,test} from "@playwright/test";

test("landing page explains Sauti and reaches authentication",async({page})=>{
  await page.goto("/");
  await expect(page.getByRole("heading",{name:"Hear Kenya."})).toBeVisible();
  await expect(page.getByText("Artists promote music. DJs and matatus play it. Everyone sees the results.",{exact:true})).toBeVisible();
  await page.getByRole("link",{name:/Join Sauti/i}).first().click();
  await expect(page).toHaveURL(/\/signup/);
  await expect(page.getByRole("heading",{name:/Create your account/i})).toBeVisible();
});

test("protected role routes send guests to sign in",async({page})=>{
  for(const route of ["/listener","/artist","/dj","/matatu","/admin"]){
    await page.goto(route);
    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByRole("heading",{name:/Sign in to Sauti/i})).toBeVisible();
  }
});

test("authentication forms report expected validation errors",async({page})=>{
  await page.goto("/signup");
  await page.getByLabel(/name/i).fill("Test User");
  await page.getByLabel(/email/i).fill("invalid@example.com");
  await page.getByLabel(/^password/i).fill("short");
  const signupPassword=page.getByLabel(/^password/i);
  await expect(signupPassword).toHaveAttribute("minlength","8");
  await expect(signupPassword).toHaveAttribute("required","");

  await page.goto("/login");
  await expect(page.getByLabel("Email")).toHaveAttribute("required","");
  await expect(page.getByRole("textbox",{name:"Password"})).toHaveAttribute("required","");
});
