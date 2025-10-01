'use client'

import React, { useState } from 'react'
import { PurchaseFilters, PurchaseList } from '@/components/features/purchases'
import { ErrorBoundary } from '@/components/common/error-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Purchase } from '@/types'
import { Plus, TrendingUp, DollarSign, Calendar } from 'lucide-react'

export default function Home() {
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null)

  const handlePurchaseClick = (purchase: Purchase) => {
    setSelectedPurchase(purchase)
  }

  const handleCloseDetails = () => {
    setSelectedPurchase(null)
  }

  return (
    <main className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Budget App</h1>
              <p className="text-muted-foreground mt-1">
                Track your expenses and manage your budget
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Purchase
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar with Filters and Stats */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    This Month
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$2,847.32</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Transactions
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">127</div>
                  <p className="text-xs text-muted-foreground">
                    +8 from yesterday
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. per Day
                  </CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">$91.85</div>
                  <p className="text-xs text-muted-foreground">
                    Based on 31 days
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <PurchaseFilters collapsible={false} />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Purchase List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">Recent Purchases</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      Export
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ErrorBoundary>
                  <PurchaseList
                    onPurchaseClick={handlePurchaseClick}
                    showCount
                    enableRefresh
                    enableVirtualization
                  />
                </ErrorBoundary>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Purchase Details Modal/Sidebar (when a purchase is selected) */}
      {selectedPurchase && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleCloseDetails()
            }
          }}
        >
          <dialog 
            open
            className="bg-background border rounded-lg shadow-lg p-6 w-full max-w-md max-h-[80vh] overflow-y-auto m-0"
            aria-labelledby="purchase-details-title"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                handleCloseDetails()
              }
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 id="purchase-details-title" className="text-lg font-semibold">Purchase Details</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleCloseDetails}
                aria-label="Close purchase details dialog"
              >
                ✕
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{selectedPurchase.merchantName}</h3>
                <p className="text-muted-foreground">{selectedPurchase.description}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Amount</h4>
                  <p className="text-xl font-bold">
                    ${selectedPurchase.amount.toFixed(2)} {selectedPurchase.currency}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Date</h4>
                  <p>{selectedPurchase.date.toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedPurchase.category.color }}
                  />
                  <span>{selectedPurchase.category.name}</span>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Payment Method</h4>
                <p>{selectedPurchase.paymentMethod.nickname || selectedPurchase.paymentMethod.provider || 'Cash'}</p>
              </div>

              {selectedPurchase.metadata.location && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                  <p>
                    {selectedPurchase.metadata.location.city}, {selectedPurchase.metadata.location.province}
                  </p>
                </div>
              )}

              {selectedPurchase.metadata.notes && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Notes</h4>
                  <p className="text-sm">{selectedPurchase.metadata.notes}</p>
                </div>
              )}

              {selectedPurchase.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {selectedPurchase.tags.map(tag => (
                      <span 
                        key={tag}
                        className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </dialog>
        </div>
      )}
    </main>
  )
}