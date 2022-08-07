import { FixtureFactory } from 'interface-forge'
import path from 'path'
import { WP_REST_API_Object_Links } from 'wp-types'

import { fakeObjectLink } from '../util'

const fixtureDir = path.resolve(__dirname, '..', '..')

export const WPObjectLinksFactory =
	new FixtureFactory<WP_REST_API_Object_Links>(
		() => ({
			'predecessor-version': [fakeObjectLink],
			'version-history': [fakeObjectLink],
			'wp:attachment': [fakeObjectLink],
			'wp:featuredmedia': [fakeObjectLink],
			'wp:term': [fakeObjectLink],
			'about': [fakeObjectLink],
			'collection': [fakeObjectLink],
			'counter': [fakeObjectLink],
			'curies': [fakeObjectLink],
		}),
		undefined,
		fixtureDir,
	)
