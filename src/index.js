/* searchspring imports */
import { Snap } from '@searchspring/snap-preact';
import { getScriptContext } from '@searchspring/snap-toolbox';

/* local imports */
import { searchspring } from '../package.json';
import { searchPlugin } from './scripts/searchPlugin';
import './styles/custom.scss';

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

const config = {
	url: {
		parameters: {
			query: { name: 'q' },
		},
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
					plugins: [[searchPlugin]],
					globals: {
						filters: backgroundFilters,
					},
				},
				targeters: [
					{
						name: 'title',
						selector: '.ss-shop .section-header__title',
						component: async () => (await import('./components/SearchHeader')).SearchHeader,
						hideTarget: true,
					},
					{
						name: 'sort',
						selector: '#CollectionSection .section-header__link--right',
						component: async () => (await import('./components/SortBy')).SortBy,
						hideTarget: true,
					},
					{
						name: 'main',
						selector: '#searchspring-content',
						component: async () => (await import('./components/Content')).Content,
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
				targeters: [
					{
						selector: '.header-bar__search-input',
						component: async () => (await import('./components/Autocomplete')).Autocomplete,
					},
				],
			},
		],
	},
};

const snap = new Snap(config);
