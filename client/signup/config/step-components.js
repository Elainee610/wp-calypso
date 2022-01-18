const stepNameToModuleName = {
	about: 'about',
	'clone-start': 'clone-start',
	'clone-destination': 'clone-destination',
	'clone-credentials': 'clone-credentials',
	'clone-point': 'clone-point',
	'clone-jetpack': 'clone-jetpack',
	'clone-ready': 'clone-ready',
	'clone-cloning': 'clone-cloning',
	courses: 'courses',
	'creds-confirm': 'creds-confirm',
	'creds-complete': 'creds-complete',
	'creds-permission': 'creds-permission',
	domains: 'domains',
	emails: 'emails',
	'domains-store': 'domains',
	'domain-only': 'domains',
	'domains-theme-preselected': 'domains',
	'domains-launch': 'domains',
	'from-url': 'import-url',
	/* import-url will eventually replace from-url step. Forgive temporary naming. */
	'import-url': 'import-url-onboarding',
	'intent-screen': 'intent-screen',
	launch: 'launch-site',
	plans: 'plans',
	'plans-new': 'plans',
	'plans-business': 'plans',
	'plans-ecommerce': 'plans',
	'plans-import': 'plans',
	'plans-launch': 'plans',
	'plans-personal': 'plans',
	'plans-premium': 'plans',
	'plans-site-selected': 'plans',
	'plans-store-nux': 'plans-atomic-store',
	'select-domain': 'domains',
	site: 'site',
	'rewind-migrate': 'rewind-migrate',
	'rewind-were-backing': 'rewind-were-backing',
	'rewind-form-creds': 'rewind-form-creds',
	'site-or-domain': 'site-or-domain',
	'site-picker': 'site-picker',
	'site-title': 'site-title',
	'site-options': 'site-options',
	'site-topic': 'site-topic',
	'site-topic-with-theme': 'site-topic',
	'site-type-with-theme': 'site-type',
	'starting-point': 'starting-point',
	survey: 'survey',
	'survey-user': 'survey-user',
	test: 'test-step',
	themes: 'theme-selection',
	'themes-site-selected': 'theme-selection',
	'template-first-themes': 'theme-selection',
	user: 'user',
	'user-new': 'user',
	'oauth2-user': 'user',
	'oauth2-name': 'user',
	displayname: 'user',
	'reader-landing': 'reader-landing',
	passwordless: 'passwordless',
	'p2-details': 'p2-details',
	'p2-site': 'p2-site',
	'p2-get-started': 'p2-get-started',
	'p2-confirm-email': 'p2-confirm-email',
	'plans-business-monthly': 'plans',
	'plans-ecommerce-monthly': 'plans',
	'plans-personal-monthly': 'plans',
	'plans-premium-monthly': 'plans',
	'design-setup-site': 'design-picker',
	'new-or-existing-site': 'new-or-existing-site',
	'difm-site-picker': 'difm-site-picker',
	'difm-design-setup-site': 'design-picker',
	'site-info-collection': 'site-info-collection',
	intent: 'intent',
	list: 'import',
	capture: 'import',
	ready: 'import',
	importing: 'import-from',
	'select-site': 'woocommerce-install/select-site',
	'business-info': 'woocommerce-install/step-business-info',
	'store-address': 'woocommerce-install/step-store-address',
	confirm: 'woocommerce-install/confirm',
	transfer: 'woocommerce-install/transfer',
};

export function getStepModuleName( stepName ) {
	return stepNameToModuleName[ stepName ] || '';
}

export async function getStepComponent( stepName ) {
	const moduleName = stepNameToModuleName[ stepName ];
	const module = await import(
		/* webpackChunkName: "async-load-signup-steps-[request]" */
		/* webpackInclude: /signup\/steps\/[0-9a-z/-]+\/index\.[j|t]sx$/ */
		/* webpackExclude: /signup\/steps\/[0-9a-z/-]+\/test\/index\.[j|t]sx$/ */
		`calypso/signup/steps/${ moduleName }`
	);
	return module.default;
}
