# create venv
	python3 -m venv .env
	source ./.env/bin/activate
	python3 -m pip install --upgrade pip
	pip install --no-cache-dir -r requirements.txt

# start project
	django-admin startproject userManagement

# new apps
	cd userManagement; python manage.py startapp base;
	cd base; mkdir templates templates/registeration; cd ..
	add 'base' to "INSTALLED_APPS" section at userManagement/settings.py file

# postgresql
	change "DATABASES" at settings.py file:
		DATABASES = {
			"default": {
				"ENGINE": "django.db.backends.postgresql",
				"NAME": "postgres",
				"USER": "adminuser",
				"PASSWORD": "adminpass",
				"HOST": "127.0.0.1",
				"PORT": "5432",
			}
		}

	python manage.py manage.py migrate