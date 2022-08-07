import { FixtureFactory } from 'interface-forge'
import path from 'path'
import { WP_Post_Type_Name } from 'wp-types'

import { WPPage } from '../../src/types'
import { fakeNumber } from '../util'
import { WPPostFactory } from './post.factory'

const fixtureDir = path.resolve(__dirname, '..', '..')

export const WPPageFactory = new FixtureFactory<WPPage>(
	() => ({
		...WPPostFactory.buildSync(),
		type: WP_Post_Type_Name.page,
		menu_order: 0,
		parent: FixtureFactory.sample([0, 0, fakeNumber()]),
	}),
	undefined,
	fixtureDir,
)
