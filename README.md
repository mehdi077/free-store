hi, my name is mehdi, and this is a nextJs 15 app, wich is intended to be a full e commerce platform. with an admin panel, product page, categories, order managment, facebook pixel ... etc

This simple solution covers all the basics for a complete e-commerce website, with the ability of using it for FREE.

(important note: this platform was desgined to have only cash on dilvery as the only payment option, and os personlized to show only cities in Algeria.
if you need specific personlization, contact me on whatsapp via `+213792107513`)

the idea was to be able to have an e commerce website for free, levreging the vercel hobby plan, wich lets users deploy nextJs code and host it for free (uunder a subdomain of "your-store-name.vercel.app"), and also using the always free plan of the BAAS used in this project, wich is convex.

- setting up this web app is simple and stright forward:

1 * fork this repo into you github account.

2 * create a vercel account, and connect your account with your github account.

3 * create a convex account (you can create a convex account using only github).

4 * create a new project in vercel and import the forked repo of this project.

5 * turn on "build command" in the build settings, and use this command in it `npx convex deploy --cmd 'npm run build'`

6 * turn on the "install command" and use in it this command `npm install`

![image](https://github.com/user-attachments/assets/bc4fe6d6-e988-4a9d-943b-bc5ffdd72b36)

7 * go to your convex account and create a new project, give it a name and click on "production"

![image](https://github.com/user-attachments/assets/81af716c-472b-47fd-a1d0-852407ad110f)

8 * in the setting, locat the "deploy keys" and generate a new key.

![image](https://github.com/user-attachments/assets/1b5a1aa6-a1b3-44d0-9c1a-375602ae0d96)

9 * take that key, and go back to vercel, and input a new envirment variable with that key naming it "CONVEX_DEPLOY_KEY"

10 * you should have also the facebook pixel id ready, wich goes as a second envirment variable named "NEXT_PUBLIC_FACEBOOK_PIXEL_ID"

![image](https://github.com/user-attachments/assets/4c8de0ad-984d-48d3-ae94-444621f67d8d)

11 * click deploy.



### what this simple e-commerce platform offers:


- it has a very basic home page, displaying the categories and some of the products in it.

![image](https://github.com/user-attachments/assets/df91c2b6-85bb-45c1-9b2e-11aa54ae5834)

- a category page to show all the products in that category.

![image](https://github.com/user-attachments/assets/11f277a2-c480-4ad4-a865-56a11de9a06a)
![image](https://github.com/user-attachments/assets/161c52cc-781b-4a02-b577-a453ad84aa25)

- a product page, wich has by default only one payment option wich is 'cash on delivery', and a moobile responsive desgine to customize and turn into a profetoinal landing page.

![Screenshot from 2025-05-13 07-14-26](https://github.com/user-attachments/assets/f8d15a4d-684b-402c-ad7a-5dda0fe7162f)

- an admin panel wich is protected by an email and password, that has orders managment, prodct creation, product editing, category creation, a gallery, logo changing, name changing ... etc

![Screenshot from 2025-04-27 23-19-33](https://github.com/user-attachments/assets/52e8cdac-1e8e-4daf-893e-ec837ecee1c4)
![Screenshot from 2025-04-27 23-18-25](https://github.com/user-attachments/assets/bbf494ff-a1ab-431e-bbca-945b12bf5f1b)
![Screenshot from 2025-04-27 23-19-22](https://github.com/user-attachments/assets/97c8c47d-fd87-4fcc-a5cf-be8ab8509300)
![Screenshot from 2025-04-27 23-18-58](https://github.com/user-attachments/assets/c9c24489-d2cd-46bb-bbe1-f8b51731102f)
![Screenshot from 2025-04-27 23-19-51](https://github.com/user-attachments/assets/8747a40c-6a8a-4279-96ce-fd8a8015a6d9)
![Screenshot from 2025-04-27 23-19-42](https://github.com/user-attachments/assets/910c6429-c2a5-4f87-9c84-c91357819e00)







