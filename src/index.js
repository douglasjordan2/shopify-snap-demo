import { h, Fragment, render } from 'preact';
import { configure as configureMobx } from 'mobx';

/* searchspring imports */
import { Snap } from '@searchspring/snap-preact';
import { getScriptContext } from '@searchspring/snap-toolbox';

/* local imports */
import { searchspring } from '../package.json';
import { middleware } from './scripts/middleware';
import './styles/custom.scss';

import { SearchHeader } from './components/SearchHeader';
import { SortBy } from './components/SortBy';
import { Content } from './components/Content';
import { Autocomplete } from './components/Autocomplete';

/*
	background filtering
 */

const script = document.getElementById('searchspring-context');
const context = script ? getScriptContext(script, ['collection', 'tags', 'template', 'shopper']) : {};
const backgroundFilters = [];

if (context.collection?.handle) {
	// set background filter
	if (context.collection.handle != 'all') {
		backgroundFilters.push({
			field: 'collection_handle',
			value: context.collection.handle,
			type: 'value',
			background: true,
		});
	}

	// handle collection tags (filters)
	if (context.tags) {
		var collectionTags = context.tags.toLowerCase().replace(/-/g, '').replace(/ +/g, '').split('|');
		collectionTags.forEach((tag) => {
			backgroundFilters.push({
				field: 'ss_tags',
				value: tag,
				type: 'value',
				background: true,
			});
		});
	}
}

/*
	configuration and instantiation
 */

configureMobx({
	useProxies: 'never',
});

const config = {
	parameters: {
		query: { name: 'q' },
	},
	client: {
		globals: {
			siteId: searchspring.siteId,
		},
	},
	controllers: {
		search: [
			{
				config: {
					id: 'search',
					plugin: middleware,
					globals: {
						filters: backgroundFilters,
					},
				},
				targets: [
					{
						name: 'title',
						selector: '.ss-shop .section-header__title',
						component: SearchHeader,
						hideTarget: true,
					},
					{
						name: 'sort',
						selector: '#CollectionSection .section-header__link--right',
						component: SortBy,
						hideTarget: true,
					},
					{
						name: 'main',
						selector: '#searchspring-content',
						component: Content,
						hideTarget: true,
					},
				],
			},
		],
		autocomplete: [
			{
				config: {
					id: 'autocomplete',
					selector: '.header-bar__search-input',
				},
				targets: [
					{
						selector: '.header-bar__search-input',
						component: Autocomplete,
					},
				],
			},
		],
	},
};

const snap = new Snap(config);
const { search, autocomplete } = snap.controllers;

search.store.custom.respondAt = '(max-width: 768px)';