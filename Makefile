.PHONY: netlify
.PHONY: example-build example-deps

EXAMPLES_PATH = examples
EXAMPLES = one
EXAMPLES_APPS = $(addprefix $(EXAMPLES_PATH)/,$(EXAMPLES))
EXAMPLES_APPS_DEPS = $(addsuffix /node_modules/installed_dependencies,$(EXAMPLES_APPS))

WRAPPER_PACKAGES = native-package expo-package
WRAPPER_PACKAGES_DEPS = $(addsuffix /node_modules/installed_dependencies,$(WRAPPER_PACKAGES))

SOURCES = $(filter(%$(EXAMPLES_PATH)/, $(wildcard *.js) $(wildcard */*.js) $(wildcard */*.scss) $(wildcard */*.png) $(wildcard */*.html) $(wildcard ../client/*/*.js) $(wildcard ../client/*.js))
LIB_SOURCES = $(wildcard *.js) $(wildcard */*.js) $(wildcard */*.scss) $(wildcard */*.png) $(wildcard */*.html) $(wildcard ../client/*/*.js) $(wildcard ../client/*.js)

CHAT_DEPS = ../client/package.json

example-deps: $(EXAMPLES_APPS_DEPS)

$(EXAMPLES_APPS_DEPS): %/node_modules/installed_dependencies: %/yarn.lock %/package.json $(SOURCES) $(WRAPPER_PACKAGES_DEPS)
	cd $* && yarn install
	touch $@

$(WRAPPER_PACKAGES_DEPS): %/node_modules/installed_dependencies: %/yarn.lock %/package.json $(SOURCES) node_modules/installed_dependencies
	cd $* && yarn install
	touch $@

node_modules/installed_dependencies: yarn.lock package.json
	yarn install
	touch $@

dist/built: $(LIB_SOURCES) node_modules/installed_dependencies
	yarn build
	touch $@ q

clean:
	rm -rf $(addsuffix /node_modules,$(EXAMPLES_APPS))
	rm -rf build
	rm -rf node_modules

