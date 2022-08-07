import { FixtureFactory } from 'interface-forge'
import path from 'path'
import { WP_Taxonomy_Name } from 'wp-types'

import { WPTag } from '../../src/types'
import { fakeTaxonomy } from '../util'

const fixtureDir = path.resolve(__dirname, '..', '..')

export const WPTagFactory = new FixtureFactory<WPTag>(
	() => ({
		...fakeTaxonomy(),
		taxonomy: WP_Taxonomy_Name.post_tag,
	}),
	undefined,
	fixtureDir,
)
