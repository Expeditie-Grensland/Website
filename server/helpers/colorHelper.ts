import i18next = require('i18next');

import { Route } from '../components/route';
import { Util } from '../components/document/util';
import { IRouteNode } from "../components/routenode/model";
import { RouteOrID } from "../components/route/model";

const sprintf = require('sprintf-js').sprintf;

export namespace ColorHelper {
    export enum Color {
        Red = '#e6194b',
        Green = '#3cb44b',
        Yellow = '#ffe119',
        Blue = '#0082c8',
        Orange = '#f58231',
        Teal = '#008080',
        Brown = '#aa6e28',
        Maroon = '#800000',
        Navy = '#000080',
        Grey = '#808080'
    }

    let nodesCached: Map<string, IRouteNode[]> = new Map();

    export async function init() {
        const routes = await Route.getRoutes();

        for (let route of routes) {
            nodesCached.set(route._id, await Route.getNodes(route));
        }
    }

    export function resetCache() {
        nodesCached = new Map();
    }

    /**
     * Selects a non-used color for the specified routenode. If this node has the same
     * people as an existing node, the color will be the same.
     *
     * ColorHelper maintains an internal cache of all RouteNodes to which, by default, all nodes are added. This should
     * obviously only happen if the node is going to be saved to the models, so if a node will not be saved to the
     * models, set the `cache` parameter to false.
     *
     * @param {IRouteNode} node The IRouteNode to get the color for.
     * @param {boolean} cache Whether to save `node` in the internal cache of ColorHelper.
     * @returns {string} A hex color string.
     */
    export function generateColorForRouteNode(node: IRouteNode, cache: boolean = true): string {
        const existingNodes = getCachedRouteNodes(node.route);

        const similarNode = existingNodes.find(n => Route.personArraysEqual(n.persons, node.persons));

        if (similarNode !== undefined) {
            return similarNode.color;
        }

        if (cache) addCachedNode(node);

        return getColorByIndex(existingNodes.length);
    }

    function addCachedNode(node: IRouteNode) {
        let nodes = [];

        if (nodesCached.has(Util.getObjectID(node.route))) {
            nodes = nodesCached.get(Util.getObjectID(node.route));
        }

        nodes.push(node);

        nodesCached.set(Util.getObjectID(node.route), nodes);
    }

    function getCachedRouteNodes(route: RouteOrID): IRouteNode[] {
        const nodes = nodesCached.get(Util.getObjectID(route));

        return nodes === undefined ? [] : nodes;
    }

    function getColorByIndex(index: number): Color {
        if (index >= getAmountOfColors()) {
            throw new RangeError(sprintf(i18next.t('colorhelper_error_not_enough_colors'), getAmountOfColors(), index + 1));
        }

        return Color[Object.keys(Color)[index]];
    }

    function getAmountOfColors(): number {
        return Object.keys(Color).length;
    }
}
