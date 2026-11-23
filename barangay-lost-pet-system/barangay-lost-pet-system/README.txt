# Barangay Pet Finder

A beginner-friendly web-based lost and found pet reporting demo built with HTML, CSS, and vanilla JavaScript.

## Run the project
1. Extract the ZIP file.
2. Open the `barangay-lost-pet-system` folder.
3. Double-click `index.html` or open it in a browser.

## Features
- User login, account creation, and admin login
- Separate user and administrator sessions
- Administrators can delete reports
- Administrators can create and delete resident accounts
- Submit Lost Pet and Found Pet reports
- Search reports by pet name, animal, color, or location
- Filter reports by Lost or Found
- Dashboard counts for all, lost, and found reports
- Admin can delete a report
- Saves reports in the browser using localStorage

## Admin login
Default demo credentials:
- Username: admin
- Password: admin123

The login state lasts until the browser tab is closed or the user logs out. Change the
ADMIN_USERNAME and ADMIN_PASSWORD values in script.js for this static demo.

## Database note
This demo does not use an online database. It uses browser `localStorage`, so reports are saved only on the same browser/device. For a real barangay system where multiple residents can see reports, connect it to a shared database such as MySQL with PHP, or Firebase/Supabase.

## Suggested future improvements
- Admin login and approval of reports
- Upload pet photos
- Barangay/purok selection
- MySQL database and backend API
- Report status: Missing, Reunited, or Closed
