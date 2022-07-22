import * as dat from 'dat.gui'
import { vhCalc } from './utils'
import Menu from './menu'

const gui = new dat.GUI({ closeOnTop: false })

window.onload = () => {
	vhCalc()
	new Menu()
}
