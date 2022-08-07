import { FixtureFactory } from 'interface-forge'
import path from 'path'
import { WP_Taxonomy_Name } from 'wp-types'

import { WPCategory } from '../../src/types'
import { fakeNumber, fakeTaxonomy } from '../util'

const fixtureDir = path.resolve(__dirname, '..', '..')

export const WPCategoryFactory = new FixtureFactory<WPCategory>(
	() => ({
		...fakeTaxonomy(),
		taxonomy: WP_Taxonomy_Name.category,
		parent: FixtureFactory.sample([0, 0, fakeNumber()]),
	}),
	undefined,
	fixtureDir,
)
