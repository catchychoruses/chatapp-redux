describe('template spec', () => {
  it('passes', () => {
    cy.visit('');

    cy.get('[data-testid="auth-email-field"]').type('smthng');
    cy.get('[data-testid="auth-password-field"]').type('smthng');
    cy.get('[data-testid="submit"]').click();
  });
});
