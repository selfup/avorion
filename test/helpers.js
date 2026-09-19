import { expect } from 'chai';

export const childrenOf = vnode => vnode.children;

export const findChild = (vnode, name) =>
  vnode.children.find(child => child && child.name === name);

export const findChildren = (vnode, name) =>
  vnode.children.filter(child => child && child.name === name);

export const assertVNode = (vnode, name) => {
  expect(vnode, 'expected a vnode').to.be.an('object');
  expect(vnode.name).to.equal(name);
};