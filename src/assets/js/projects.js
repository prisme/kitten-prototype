import { vhCalc } from './utils'
import Grid, { convertJSONToHTML } from './grid'
import Menu from './menu'
import projectData from './../json/projects.json'

window.onload = () => {
	vhCalc()
	new Menu()
	new Grid({
		hasDynamicTitle: true,
	})
	// convertJSONToHTML(projectData.medias)
}
