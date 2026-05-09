const fs = require('fs');

let envContent = fs.readFileSync('.env', 'utf8');

const privateKey = `-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDjeg1yRDMTldag\\nNud7CiJSUwWw6ZhXNv4JE3YXoXhpFMhBMGf9dLNEXPq56zVvaAyNyFyPWPuXAnT/\\nMuVl9Ke1lJvZ0dIe70VgjI/qfU1DCep74/bxpSUk9TxPZwPRju/E9UEV63srDAiY\\ni7jGLdmoMwWW2y+Vol6c1qwJxQNgtIrtyvrSJ/ooVaERl54X3/kj+yCdb7U44LLf\\n52PYAO48XaS0WGd/OTNNt0kbxJn/K9AbmBcf+PCRIm0/ca2dWAHYQ1k2JQ24JpD+\\nOrEcdYJw9m1TBJS9LsmoWS8qVF0bTDdOTTG3iGQq2kQaR8Xeiwg3a+S5FmMw3tH2\\neiuUxxxBAgMBAAECggEAHAeELGQrrIJCLt3xDjvIkJ8PBJZ2CWoa6YyiuKTyeLVB\\nOyofKC+W7smrsdjCDfMS1+4cPKQU5S2985umgVaBC0pvXUrBwsLOKEhNq/HKYUQx\\nptgnS62DGw+WQbzybyIXGIx1W4F3fO2Hyh8uUoogB54Y1la2AXC/SoFXs8D5SnMd\\nGoSqFjrqQZVpd+qwF+/+sA8sQHhFgldX2Y1AjOzQQ33PtwpMJX7w+IcdRWrHSdR3\\n/hLduDvf4vX2pAMijTlk/9x8TajRr5Mz7x/5e1fvBqJF995in/piyeFBwFXWzAFE\\n8qf/u6GVN0+iJVC+Y/F9GflcsD7UmmFJz2ZlCovTKQKBgQD/NmGYR899yZ3Rfd+3\\nJCIlwL8V+/AXrd86CtQL4CZ3U8ZZcl5JO2bLG9iXl7bfxvPu/WZeOX4cgS1f5kFv\\nw0BrpCm2ZTlpSWWzetiT8a6E5N5t4593Tep4A+StlP8pbrtwyrcOhE+8lA5XO2mU\\nSOjKysK5AMD7MREyZnG48hv2SQKBgQDkLcKQuH6pnaC+Fli7A5rvOUAlGNBGrokk\\nw4aRFZj0pmuIHPQVyJB9OMAWlSSc+8yfpDlURvSvNPQWA/h1CFOE1sSamM4mLnl9\\nTyRzlS1x/fCEvBK+R5CJSR9G6cU22WKXkxwjdR5KuzjiUdMKSexG5XrKYrxKLGsX\\n8kTVLksWOQKBgGv2SVruJeyEeerBYP5MntVxsGRQa8TYnPIk2ocbj6ozGlmEdDZu\\nlpGdegbG+2m29EJJmCCMGbldPCCxe0UYSAxBKhQqxhqwHgHLGgub1cQKPb4m6LLD\\nl0il/PshaL/SRCD24HGXr1OLHnXwgD1minQfSjiRBRI+M5Qqmjku0n1hAoGBAMRv\\nsKSucDzNeuiqjFDT1bpE6zgEmKmA8Ig528tjcH6OFtzjMC7gr6NeC+BlHVQYYhy9\\nYK1xOIztZYTefjMiq+QckL0W98JfGDAMxjDLKIiOOVXMI8a0DXZjAQ4niqShmQMs\\nnnjYBvAHJf2Qu8KLyWFvhbpeLgMdIkVHSILOi83hAoGAcrl5DNrys+I5WX4QlfTt\\nTWKg8I6Xc4Q9xyBtYaL8AaWniNaCJQm2EP6wMHmY7wQXrsNZJ7VAkZ3D6r7qQ1tN\\n3jalQBnf35HZNSy7DCO9s4V26PtwCX7G2doVHI398NpFaK5fwdpvrrhKOdyZ/oSL\\nfDb0iqv6EtBF65WYx1dAu/E=\\n-----END PRIVATE KEY-----\\n`;

envContent += `\nNEXT_PUBLIC_VAPID_KEY="BHly0nRyfWLoCp3-pNxb3rFQ1s3p8dm8hfVI-Lfy07iPSEficJ-R1milodekixy6NmdjEKcT5NRYQ_Fy6ddVDZw"\n`;
envContent += `FIREBASE_PROJECT_ID="tasknotif-2b734"\n`;
envContent += `FIREBASE_CLIENT_EMAIL="firebase-adminsdk-fbsvc@tasknotif-2b734.iam.gserviceaccount.com"\n`;
envContent += `FIREBASE_PRIVATE_KEY="${privateKey}"\n`;

fs.writeFileSync('.env', envContent);
console.log('Updated .env');
